import { Controller, Get, UseGuards, Query, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../infrastructure/nestjs/guards/jwt-auth.guard';
import { RefundStatus } from '../../entity/refund/refund.entity';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getDashboardSummary() {
    return this.dashboardService.getDashboardSummary();
  }

  @Get('refunds/report')
  async getRefundReport(@Query('status') status?: RefundStatus) {
    return this.dashboardService.getRefundReport(status);
  }

  @Get('refunds/by-status/:status')
  async getRefundsByStatus(@Param('status') status: string) {
    const refundStatus = status.toUpperCase() as RefundStatus;
    return this.dashboardService.getRefundsByStatus(refundStatus);
  }

  @Get('refunds/by-user/:userId')
  async getRefundsByUser(@Param('userId') userId: string) {
    return this.dashboardService.getRefundsByUser(userId);
  }

  @Get('refunds/by-date-range')
  async getRefundsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dashboardService.getRefundsByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
