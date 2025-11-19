/* eslint-disable */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import databaseConfig from "../config/database.config";
import { AuthModule } from "./auth.module";

// 1. IMPORTAMOS AS CLASSES DIRETAMENTE (O VS Code vai verificar se o caminho está certo)
import { UserEntity } from '../../../entity/user/user.entity';
import { ClientEntity } from '../../../entity/client/client.entity';
import { RefundEntity } from '../../../entity/refund/refund.entity';

@Module({
  imports: [
    AuthModule,
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
        
        // 2. A MÁGICA ACONTECE AQUI: Passamos a lista fixa, sem chance de erro de pasta
        entities: [UserEntity, ClientEntity, RefundEntity],
        synchronize: true, 
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}