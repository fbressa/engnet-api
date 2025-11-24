/* eslint-disable */
import { RefundStatsDto } from './refund-stats.dto';
import { UserStatsDto } from './user-stats.dto';
import { ClientStatsDto } from './client-stats.dto';

export class DashboardSummaryDto {
  refunds: RefundStatsDto;
  users: UserStatsDto;
  clients: ClientStatsDto;
  generatedAt: Date;
}
