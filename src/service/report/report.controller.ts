import { Controller, Get, Query, UseGuards, BadRequestException, HttpCode, StreamableFile } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../../infrastructure/nestjs/guards/jwt-auth.guard';
import { RefundStatus } from '../../entity/refund/refund.entity';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('refunds/excel')
  @HttpCode(200)
  async generateRefundReport(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<StreamableFile> {
    try {
      let statusEnum: RefundStatus | undefined;
      if (status) {
        const validStatus = Object.values(RefundStatus).includes(status as RefundStatus);
        if (!validStatus) {
          throw new BadRequestException(
            `Status inválido. Valores aceitos: ${Object.values(RefundStatus).join(', ')}`,
          );
        }
        statusEnum = status as RefundStatus;
      }

      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;

      if (startDateObj && isNaN(startDateObj.getTime())) {
        throw new BadRequestException('Data de início inválida. Use formato ISO: YYYY-MM-DD');
      }

      if (endDateObj && isNaN(endDateObj.getTime())) {
        throw new BadRequestException('Data de fim inválida. Use formato ISO: YYYY-MM-DD');
      }

      const buffer = await this.reportService.generateRefundReport(
        statusEnum,
        startDateObj,
        endDateObj,
      );

      return new StreamableFile(buffer, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        disposition: `attachment; filename="refunds_${Date.now()}.xlsx"`,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao gerar relatório de reembolsos');
    }
  }

  @Get('refunds/detailed')
  @HttpCode(200)
  async generateDetailedRefundReport(
    @Query('userId') userId?: string,
  ): Promise<StreamableFile> {
    try {
      const buffer = await this.reportService.generateDetailedRefundReport(userId);

      return new StreamableFile(buffer, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        disposition: `attachment; filename="refunds_detailed_${Date.now()}.xlsx"`,
      });
    } catch (error) {
      throw new BadRequestException('Erro ao gerar relatório detalhado');
    }
  }

  @Get('summary')
  @HttpCode(200)
  async generateSummaryReport(): Promise<StreamableFile> {
    try {
      const buffer = await this.reportService.generateSummaryReport();

      return new StreamableFile(buffer, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        disposition: `attachment; filename="summary_${Date.now()}.xlsx"`,
      });
    } catch (error) {
      throw new BadRequestException('Erro ao gerar relatório de resumo');
    }
  }
}
