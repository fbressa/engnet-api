import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('EngNet API')
    .setDescription('API de Gerenciamento de Reembolsos e Clientes')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Endpoints de autenticação')
    .addTag('Users', 'Endpoints de usuários')
    .addTag('Clients', 'Endpoints de clientes')
    .addTag('Refunds', 'Endpoints de reembolsos')
    .addTag('Dashboard', 'Endpoints de dashboard')
    .addTag('Reports', 'Endpoints de relatórios')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCss: '.swagger-ui { font-family: sans-serif; }',
  });
}
