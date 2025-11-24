import { Controller, Get, Query, UseGuards, BadRequestException, HttpCode, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../../infrastructure/nestjs/guards/jwt-auth.guard';
import { RefundStatus } from '../../entity/refund/refund.entity';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('refunds/excel')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Gerar relatório Excel de reembolsos',
    description: 'Gera um arquivo Excel com reembolsos filtrados por status e/ou data'
  })
  @ApiQuery({
    name: 'status',
    type: 'string',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    description: 'Filtrar por status do reembolso'
  })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    required: false,
    description: 'Data inicial (formato ISO: YYYY-MM-DD)',
    example: '2025-01-01'
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    required: false,
    description: 'Data final (formato ISO: YYYY-MM-DD)',
    example: '2025-12-31'
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo Excel gerado com sucesso',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Filtros inválidos'
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado'
  })
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
  @ApiOperation({
    summary: 'Gerar relatório Excel detalhado de reembolsos',
    description: 'Gera um arquivo Excel com relatório detalhado e estatísticas de reembolsos'
  })
  @ApiQuery({
    name: 'userId',
    type: 'string',
    required: false,
    description: 'UUID do usuário para filtrar reembolsos',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo Excel gerado com sucesso',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado'
  })
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
  @ApiOperation({
    summary: 'Gerar relatório de resumo do sistema',
    description: 'Gera um arquivo Excel com estatísticas gerais do sistema'
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo Excel gerado com sucesso',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado'
  })
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
