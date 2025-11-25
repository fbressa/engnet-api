import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import databaseConfig from "../config/database.config";
import { AuthModule } from "./auth.module";

import { UserEntity } from '../../../entity/user/user.entity';
import { ClientEntity } from '../../../entity/client/client.entity';
import { RefundEntity } from '../../../entity/refund/refund.entity';

import { RefundModule } from '../../../service/refund/refund.module';
import { ClientModule } from '../../../service/client/client.module';
import { UserModule } from '../../../service/user/user.module';
import { DashboardModule } from '../../../service/dashboard/dashboard.module';
import { ReportModule } from '../../../service/report/report.module';
import { BodyLoggerMiddleware } from '../middlewares/body-logger.middleware';

@Module({
  imports: [
    AuthModule,
    RefundModule,
    ClientModule,
    UserModule,
    DashboardModule,
    ReportModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        
        entities: [UserEntity, ClientEntity, RefundEntity],
        synchronize: true, 
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BodyLoggerMiddleware)
      .forRoutes('*');
  }
}