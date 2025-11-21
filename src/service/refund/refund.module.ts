/* eslint-disable */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundEntity } from '../../entity/refund/refund.entity';
import { UserEntity } from '../../entity/user/user.entity';
import { RefundService } from './refund.service';
import { RefundController } from '../../controllers/refund.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RefundEntity, UserEntity])],
  controllers: [RefundController],
  providers: [RefundService],
})
export class RefundModule {}