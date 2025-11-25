/* eslint-disable */
import * as process from 'node:process';
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  // Railway fornece DATABASE_URL no formato:
  // postgresql://user:password@host:port/database
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    // Parse DATABASE_URL para Railway
    const url = new URL(databaseUrl);
    return {
      type: 'postgres',
      host: url.hostname,
      port: parseInt(url.port, 10) || 5432,
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove "/" inicial
      ssl: {
        rejectUnauthorized: false, // Railway requer SSL
      },
      synchronize: true,
      autoLoadEntities: true,
    };
  }

  // Fallback para variáveis separadas (desenvolvimento local)
  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    autoLoadEntities: true,
  };
});