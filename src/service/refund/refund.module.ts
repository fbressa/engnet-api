/* eslint-disable */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundEntity } from '../../entity/refund/refund.entity';
import { RefundService } from './refund.service';
import { RefundController } from '../../controllers/refund.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RefundEntity])], // Avisa que vamos usar a tabela de Reembolsos
  controllers: [RefundController],
  providers: [RefundService],
})
export class RefundModule {}