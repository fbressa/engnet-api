import { NestFactory } from '@nestjs/core';
import { AppModule } from './infrastructure/nestjs/module/app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './infrastructure/nestjs/config/swagger.config';
import { CustomLogger } from './infrastructure/nestjs/config/logger.config';
import { HttpExceptionFilter } from './infrastructure/nestjs/filters/http-exception.filter';
import { LoggerMiddleware } from './infrastructure/nestjs/middlewares/logger.middleware';

async function bootstrap() {
  const logger = new CustomLogger();

  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });

  // Garantir que está usando body parser para JSON
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '10mb' }));

  // VALIDAÇÃO GLOBAL - Temporariamente com validação mais permissiva para debug
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, // Permitir campos extras temporariamente
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Converte strings para números automaticamente
      },
      skipMissingProperties: false,
      disableErrorMessages: false,
    }),
  );

  // CORS - suporta múltiplas origens via variável de ambiente CORS_ORIGIN (vírgula-separadas)
  const corsOriginEnv = process.env.CORS_ORIGIN ?? '*';
  const allowedOrigins = String(corsOriginEnv)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // allow requests with no origin (like curl, server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // TRATAMENTO DE ERROS GLOBAL
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // MIDDLEWARE DE LOGS
  app.use((req, res, next) => {
    new LoggerMiddleware(logger).use(req, res, next);
  });

  // SWAGGER
  setupSwagger(app);

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port, '0.0.0.0');
  logger.log(`API iniciada na porta ${port}`, 'Bootstrap');
  logger.log(`Swagger disponível em http://localhost:${port}/api/docs`, 'Bootstrap');
}
bootstrap();
