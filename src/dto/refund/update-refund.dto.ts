/* eslint-disable */
import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { RefundStatus } from '../../entity/refund/refund.entity';

export class UpdateRefundDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsEnum(RefundStatus)
  @IsOptional()
  status?: RefundStatus;
}
