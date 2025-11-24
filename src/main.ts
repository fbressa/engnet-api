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

  // VALIDAÇÃO GLOBAL
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // TRATAMENTO DE ERROS GLOBAL
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // MIDDLEWARE DE LOGS
  app.use((req, res, next) => {
    new LoggerMiddleware(logger).use(req, res, next);
  });

  // SWAGGER
  setupSwagger(app);

  await app.listen(3000);
  logger.log('API iniciada na porta 3000', 'Bootstrap');
  logger.log('Swagger disponível em http://localhost:3000/api/docs', 'Bootstrap');
}
bootstrap();
