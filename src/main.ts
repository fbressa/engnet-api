import { NestFactory } from '@nestjs/core';
import { AppModule } from './infrastructure/nestjs/module/app.module'; // Verifique se o caminho do seu import está assim
import { ValidationPipe } from '@nestjs/common'; // <--- IMPORTANTE

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ATIVAR VALIDAÇÃO GLOBAL
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove dados que não estão no DTO (segurança)
      forbidNonWhitelisted: true, // Dá erro se enviarem dados extras
      transform: true, // Transforma os dados (ex: string '10' vira number 10)
    }),
  );

  await app.listen(3000);
}
bootstrap();
