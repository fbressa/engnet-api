# Configuração do Swagger e Logs Globais - Guia Completo

## 📋 Índice
1. [Configuração do Swagger](#configuração-do-swagger)
2. [Configuração de Logs Globais](#configuração-de-logs-globais)
3. [Integração com main.ts](#integração-com-maints)
4. [Exemplos de Uso](#exemplos-de-uso)

---

## 🔧 Configuração do Swagger

### Passo 1: Instalar dependências
```bash
npm install @nestjs/swagger swagger-ui-express
```

**Pacotes instalados:**
- `@nestjs/swagger` - Integração oficial do Swagger com NestJS
- `swagger-ui-express` - Interface web para visualizar a documentação

### Passo 2: Criar arquivo de configuração do Swagger
Crie o arquivo `src/infrastructure/nestjs/config/swagger.config.ts`:

```typescript
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
  SwaggerModule.setup('api/docs', app, document);
}
```

### Passo 3: Adicionar decoradores ao controller (Exemplo: auth.controller.ts)
```typescript
import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Fazer login',
    description: 'Autentica um usuário e retorna um token JWT'
  })
  @ApiBody({
    description: 'Credenciais do usuário',
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: LoginResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    // implementação
  }
}
```

### Passo 4: Atualizar main.ts
Veja a seção [Integração com main.ts](#integração-com-maints) abaixo.

---

## 📝 Configuração de Logs Globais

### Passo 1: Instalar dependência (Opcional, mas recomendado)
```bash
npm install winston
```

**Pacote:** `winston` - Logger profissional para Node.js

### Passo 2: Criar serviço de logs global
Crie o arquivo `src/infrastructure/nestjs/config/logger.config.ts`:

```typescript
import { Injectable, LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CustomLogger implements LoggerService {
  private logDir = 'logs';

  constructor() {
    this.createLogsDirectory();
  }

  private createLogsDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(context: string, message: string, level: string): string {
    return `[${this.getTimestamp()}] [${level.toUpperCase()}] [${context}] ${message}`;
  }

  private writeToFile(logMessage: string): void {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `${date}.log`);
    
    fs.appendFileSync(logFile, logMessage + '\n');
  }

  log(message: string, context?: string): void {
    const logMessage = this.formatLog(context || 'APP', message, 'log');
    console.log(logMessage);
    this.writeToFile(logMessage);
  }

  error(message: string, trace?: string, context?: string): void {
    const logMessage = this.formatLog(context || 'ERROR', message, 'error');
    console.error(logMessage);
    if (trace) {
      console.error(trace);
      this.writeToFile(`${logMessage}\nStack: ${trace}`);
    } else {
      this.writeToFile(logMessage);
    }
  }

  warn(message: string, context?: string): void {
    const logMessage = this.formatLog(context || 'WARN', message, 'warn');
    console.warn(logMessage);
    this.writeToFile(logMessage);
  }

  debug(message: string, context?: string): void {
    const logMessage = this.formatLog(context || 'DEBUG', message, 'debug');
    console.debug(logMessage);
    this.writeToFile(logMessage);
  }

  verbose(message: string, context?: string): void {
    const logMessage = this.formatLog(context || 'VERBOSE', message, 'verbose');
    console.log(logMessage);
    this.writeToFile(logMessage);
  }
}
```

### Passo 2: Criar middleware global de requisições
Crie o arquivo `src/infrastructure/nestjs/middlewares/logger.middleware.ts`:

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLogger } from '../config/logger.config';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private logger: CustomLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      const logMessage = `${method} ${originalUrl} - Status: ${statusCode} - IP: ${ip} - ${duration}ms`;
      
      if (statusCode >= 400) {
        this.logger.warn(logMessage, 'HTTP');
      } else {
        this.logger.log(logMessage, 'HTTP');
      }
    });

    next();
  }
}
```

### Passo 3: Criar middleware de tratamento de erros global
Crie o arquivo `src/infrastructure/nestjs/filters/http-exception.filter.ts`:

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLogger } from '../config/logger.config';

@Catch(HttpException)
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private logger: CustomLogger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorLog = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      status,
      error: exceptionResponse,
    };

    this.logger.error(
      JSON.stringify(errorLog),
      exception.stack,
      'HTTP_EXCEPTION',
    );

    response.status(status).json(errorLog);
  }
}
```

---

## 🔗 Integração com main.ts

Atualize seu `src/main.ts` da seguinte forma:

```typescript
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
  app.use(new LoggerMiddleware(logger).use);

  // SWAGGER
  setupSwagger(app);

  await app.listen(3000);
  logger.log('API iniciada na porta 3000', 'Bootstrap');
  logger.log('Swagger disponível em http://localhost:3000/api/docs', 'Bootstrap');
}

bootstrap();
```

---

## 📚 Exemplos de Uso

### Exemplo 1: Usando logger em um serviço
```typescript
import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../config/logger.config';

@Injectable()
export class MyService {
  constructor(private logger: CustomLogger) {}

  someMethod() {
    this.logger.log('Iniciando processamento', 'MyService');
    
    try {
      // seu código
      this.logger.debug('Dados processados', 'MyService');
    } catch (error) {
      this.logger.error('Erro ao processar', error.stack, 'MyService');
    }
  }
}
```

### Exemplo 2: Documentando um endpoint completo
```typescript
import { 
  Controller, 
  Get, 
  Param, 
  UseGuards,
  HttpCode 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefundService } from '../../service/refund/refund.service';

@ApiTags('Refunds')
@Controller('refunds')
export class RefundController {
  constructor(private refundService: RefundService) {}

  @Get(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter reembolso por ID',
    description: 'Retorna os detalhes de um reembolso específico'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'UUID do reembolso',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Reembolso encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  @ApiResponse({
    status: 404,
    description: 'Reembolso não encontrado',
  })
  async getRefund(@Param('id') id: string) {
    return this.refundService.findById(id);
  }
}
```

---

## 📊 Estrutura de arquivos criados

```
src/
├── infrastructure/
│   └── nestjs/
│       ├── config/
│       │   ├── swagger.config.ts         ← Novo
│       │   └── logger.config.ts          ← Novo
│       ├── middlewares/
│       │   └── logger.middleware.ts      ← Novo
│       └── filters/
│           └── http-exception.filter.ts  ← Novo
└── main.ts                                ← Atualizar
```

---

## ✅ Checklist de Implementação

- [ ] Instalar `@nestjs/swagger` e `swagger-ui-express`
- [ ] Criar `swagger.config.ts`
- [ ] Instalar `winston` (opcional)
- [ ] Criar `logger.config.ts`
- [ ] Criar `logger.middleware.ts`
- [ ] Criar `http-exception.filter.ts`
- [ ] Atualizar `main.ts`
- [ ] Adicionar decoradores Swagger nos controllers
- [ ] Testar em `http://localhost:3000/api/docs`
- [ ] Verificar logs em `logs/` directory

---

## 🚀 Testando

1. Inicie a aplicação:
```bash
npm run start:dev
```

2. Acesse o Swagger:
```
http://localhost:3000/api/docs
```

3. Verifique os logs:
```bash
cat logs/$(date +%Y-%m-%d).log
```

4. Teste um endpoint protegido no Swagger e veja os logs sendo gerados

---

## 🔍 Dicas

- **Logs em tempo real:** Use `tail -f logs/$(date +%Y-%m-%d).log`
- **Swagger melhorado:** Adicione mais decoradores como `@ApiQuery`, `@ApiHeader`, `@ApiConsumes`, etc.
- **Logger em produção:** Considere usar Winston com suporte a múltiplos transportes (console, arquivo, serviços de log)
- **Filtros de erro:** Customize o `HttpExceptionFilter` para sua lógica de negócio

