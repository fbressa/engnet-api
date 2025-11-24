/* eslint-disable */
import * as process from 'node:process';
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, 
  
  // CRIAR AS TABELAS:
  synchronize: true, 
  autoLoadEntities: true, 
}));