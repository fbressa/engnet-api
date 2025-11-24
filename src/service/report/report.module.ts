import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundEntity } from '../../entity/refund/refund.entity';
import { UserEntity } from '../../entity/user/user.entity';
import { ClientEntity } from '../../entity/client/client.entity';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RefundEntity, UserEntity, ClientEntity])],
  providers: [ReportService],
  controllers: [ReportController],
  exports: [ReportService],
})
export class ReportModule {}
