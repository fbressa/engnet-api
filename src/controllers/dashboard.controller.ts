/* eslint-disable */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from '../service/dashboard/dashboard.service';
import { DashboardSummaryDto } from '../dto/dashboard/dashboard-summary.dto';
import { RefundReportDto } from '../dto/dashboard/refund-report.dto';
import { RefundStatus } from '../entity/refund/refund.entity';
import { JwtAuthGuard } from '../infrastructure/nestjs/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(): Promise<DashboardSummaryDto> {
    return await this.dashboardService.getDashboardSummary();
  }

  @Get('refunds/report')
  async getRefundsReport(
    @Query('status') status?: RefundStatus,
  ): Promise<RefundReportDto[]> {
    if (status) {
      return await this.dashboardService.getRefundsByStatus(status);
    }
    return await this.dashboardService.getRefundReport();
  }

  @Get('refunds/by-status/pending')
  async getPendingRefunds(): Promise<RefundReportDto[]> {
    return await this.dashboardService.getRefundsByStatus(RefundStatus.PENDING);
  }

  @Get('refunds/by-status/approved')
  async getApprovedRefunds(): Promise<RefundReportDto[]> {
    return await this.dashboardService.getRefundsByStatus(RefundStatus.APPROVED);
  }

  @Get('refunds/by-status/rejected')
  async getRejectedRefunds(): Promise<RefundReportDto[]> {
    return await this.dashboardService.getRefundsByStatus(RefundStatus.REJECTED);
  }

  @Get('refunds/by-user/:userId')
  async getRefundsByUser(@Query('userId') userId: string): Promise<RefundReportDto[]> {
    return await this.dashboardService.getRefundsByUser(userId);
  }

  @Get('refunds/by-date-range')
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
