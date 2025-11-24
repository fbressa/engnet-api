/* eslint-disable */
export class RefundStatsDto {
  totalRefunds: number;
  totalAmount: number;
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  averageAmount: number;
}
