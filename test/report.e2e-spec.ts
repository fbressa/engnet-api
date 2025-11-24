import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/infrastructure/nestjs/module/app.module';

describe('ReportController (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let userId: string;

  beforeAll(
    async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      // Não usar ValidationPipe para teste de relatório
      // app.useGlobalPipes(new ValidationPipe());
      await app.init();

      // Criar um usuário e obter token
      const userEmail = `report-${Date.now()}@example.com`;
      const userRes = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Report Test User',
          email: userEmail,
          password: 'senha123',
        });
      userId = userRes.body.id;

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userEmail,
          password: 'senha123',
        });
      authToken = loginRes.body.accessToken;

      // Criar alguns reembolsos para os testes
      await request(app.getHttpServer())
        .post('/refunds')
        .send({
          description: 'Refund 1',
          amount: 100,
          userId: userId,
        });

      await request(app.getHttpServer())
        .post('/refunds')
        .send({
          description: 'Refund 2',
          amount: 200,
          userId: userId,
        });

      await request(app.getHttpServer())
        .post('/refunds')
        .send({
          description: 'Refund 3',
          amount: 150,
          userId: userId,
        });
    },
    30000,
  );

  afterAll(async () => {
    await app.close();
  });

  describe('GET /reports/refunds/excel - Refund Excel Report', () => {
    it('deve retornar erro 401 sem autenticação', () => {
      return request(app.getHttpServer())
        .get('/reports/refunds/excel')
        .expect(401);
    });

    it('deve gerar relatório Excel de reembolsos', () => {
      return request(app.getHttpServer())
        .get('/reports/refunds/excel')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.headers['content-type']).toContain(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          );
          expect(res.body).toBeTruthy();
          expect(res.text.length).toBeGreaterThan(0);
        });
    });

    it('deve filtrar relatório por status PENDING', () => {
      return request(app.getHttpServer())
        .get('/reports/refunds/excel?status=PENDING')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.headers['content-type']).toContain(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          );
          expect(res.body).toBeTruthy();
        });
    });

    it('deve retornar erro com status inválido', () => {
      return request(app.getHttpServer())
        .get('/reports/refunds/excel?status=INVALIDO')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('deve filtrar por intervalo de datas', () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      return request(app.getHttpServer())
        .get(
          `/reports/refunds/excel?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeTruthy();
        });
    });

    it('deve retornar erro com data inválida', () => {
      return request(app.getHttpServer())
        .get('/reports/refunds/excel?startDate=data-invalida')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('GET /reports/refunds/detailed - Detailed Refund Report', () => {
    it('deve retornar erro 401 sem autenticação', () => {
      return request(app.getHttpServer())
        .get('/reports/refunds/detailed')
        .expect(401);
    });

    it('deve gerar relatório detalhado de reembolsos', () => {
      return request(app.getHttpServer())
        .get('/reports/refunds/detailed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.headers['content-type']).toContain(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          );
          expect(res.body).toBeTruthy();
          expect(res.text.length).toBeGreaterThan(0);
        });
    });

    it('deve gerar relatório detalhado filtrando por usuário', () => {
      return request(app.getHttpServer())
        .get(`/reports/refunds/detailed?userId=${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeTruthy();
        });
    });
  });

  describe('GET /reports/summary - Summary Report', () => {
    it('deve retornar erro 401 sem autenticação', () => {
      return request(app.getHttpServer())
        .get('/reports/summary')
        .expect(401);
    });

    it('deve gerar relatório de resumo do sistema', () => {
      return request(app.getHttpServer())
        .get('/reports/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.headers['content-type']).toContain(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          );
          expect(res.body).toBeTruthy();
          expect(res.text.length).toBeGreaterThan(0);
        });
    });
  });
});
