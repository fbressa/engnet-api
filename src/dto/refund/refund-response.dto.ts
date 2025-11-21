/* eslint-disable */
import { RefundStatus } from '../../entity/refund/refund.entity';

export class RefundResponseDto {
  id: string;
  description: string;
  amount: number;
  status: RefundStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
