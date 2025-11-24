/* eslint-disable */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from '../service/dashboard/dashboard.service';
import { DashboardSummaryDto } from '../dto/dashboard/dashboard-summary.dto';
import { RefundReportDto } from '../dto/dashboard/refund-report.dto';
import { RefundStatus } from '../entity/refund/refund.entity';
import { JwtAuthGuard } from '../infrastructure/nestjs/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Obter resumo do dashboard',
    description: 'Retorna um resumo com estatísticas gerais do sistema'
  })
  @ApiResponse({
    status: 200,
    description: 'Resumo do dashboard',
    type: DashboardSummaryDto
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado'
  })
  async getSummary(): Promise<DashboardSummaryDto> {
    return await this.dashboardService.getDashboardSummary();
  }

  @Get('refunds/report')
  @ApiOperation({
    summary: 'Obter relatório de reembolsos',
    description: 'Retorna um relatório filtrado de reembolsos por status'
  })
  @ApiQuery({
    name: 'status',
    type: 'string',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    description: 'Status do reembolso para filtrar'
  })
  @ApiResponse({
    status: 200,
    description: 'Relatório de reembolsos',
    type: [RefundReportDto]
  })
  async getRefundsReport(
    @Query('status') status?: RefundStatus,
  ): Promise<RefundReportDto[]> {
    if (status) {
      return await this.dashboardService.getRefundsByStatus(status);
    }
    return await this.dashboardService.getRefundReport();
  }

  @Get('refunds/by-status/pending')
  @ApiOperation({
    summary: 'Obter reembolsos pendentes',
    description: 'Retorna todos os reembolsos com status PENDING'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reembolsos pendentes',
    type: [RefundReportDto]
  })
  async getPendingRefunds(): Promise<RefundReportDto[]> {
    return await this.dashboardService.getRefundsByStatus(RefundStatus.PENDING);
  }

  @Get('refunds/by-status/approved')
  @ApiOperation({
    summary: 'Obter reembolsos aprovados',
    description: 'Retorna todos os reembolsos com status APPROVED'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reembolsos aprovados',
    type: [RefundReportDto]
  })
  async getApprovedRefunds(): Promise<RefundReportDto[]> {
    return await this.dashboardService.getRefundsByStatus(RefundStatus.APPROVED);
  }

  @Get('refunds/by-status/rejected')
  @ApiOperation({
    summary: 'Obter reembolsos rejeitados',
    description: 'Retorna todos os reembolsos com status REJECTED'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reembolsos rejeitados',
    type: [RefundReportDto]
  })
  async getRejectedRefunds(): Promise<RefundReportDto[]> {
    return await this.dashboardService.getRefundsByStatus(RefundStatus.REJECTED);
  }

  @Get('refunds/by-user/:userId')
  @ApiOperation({
    summary: 'Obter reembolsos por usuário',
    description: 'Retorna todos os reembolsos de um usuário específico'
  })
  @ApiQuery({
    name: 'userId',
    type: 'string',
    description: 'UUID do usuário'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reembolsos do usuário',
    type: [RefundReportDto]
  })
  async getRefundsByUser(@Query('userId') userId: string): Promise<RefundReportDto[]> {
    return await this.dashboardService.getRefundsByUser(userId);
  }

  @Get('refunds/by-date-range')
  @ApiOperation({
    summary: 'Obter reembolsos por intervalo de datas',
    description: 'Retorna reembolsos dentro de um intervalo de datas especificado'
  })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    description: 'Data inicial (formato ISO 8601: YYYY-MM-DD)',
    example: '2025-01-01'
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    description: 'Data final (formato ISO 8601: YYYY-MM-DD)',
    example: '2025-12-31'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reembolsos no intervalo',
    type: [RefundReportDto]
  })
  @ApiResponse({
    status: 400,
    description: 'Datas inválidas'
  })
  async getRefundsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<RefundReportDto[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Datas inválidas. Use o formato ISO 8601 (YYYY-MM-DD)');
    }

    return await this.dashboardService.getRefundsByDateRange(start, end);
  }
}
