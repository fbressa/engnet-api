import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/infrastructure/nestjs/module/app.module';
import { RefundStatus } from '../src/entity/refund/refund.entity';

describe('DashboardController (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let userId: string;

  beforeAll(
    async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe());
      await app.init();

      // Criar um usuário e obter token
      const userEmail = `dashboard-${Date.now()}@example.com`;
      const userRes = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Dashboard Test User',
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

  describe('GET /dashboard/summary - Dashboard Summary', () => {
    it('deve retornar erro 401 sem autenticação', () => {
      return request(app.getHttpServer())
        .get('/dashboard/summary')
        .expect(401);
    });

    it('deve retornar resumo do dashboard com autenticação', () => {
      return request(app.getHttpServer())
        .get('/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('refunds');
          expect(res.body).toHaveProperty('users');
          expect(res.body).toHaveProperty('clients');
          expect(res.body).toHaveProperty('generatedAt');

          // Validar stats de reembolsos
          expect(res.body.refunds).toHaveProperty('totalRefunds');
          expect(res.body.refunds).toHaveProperty('totalAmount');
          expect(res.body.refunds).toHaveProperty('byStatus');
          expect(res.body.refunds).toHaveProperty('averageAmount');
          expect(res.body.refunds.totalRefunds).toBeGreaterThan(0);

          // Validar stats de usuários
          expect(res.body.users).toHaveProperty('totalUsers');
          expect(res.body.users).toHaveProperty('activeUsers');
          expect(res.body.users).toHaveProperty('usersWithoutRefunds');

          // Validar stats de clientes
          expect(res.body.clients).toHaveProperty('totalClients');
          expect(res.body.clients).toHaveProperty('totalWithRefunds');
          expect(res.body.clients).toHaveProperty('totalWithoutRefunds');
        });
    });

    it('deve calcular corretamente o total de reembolsos', () => {
      return request(app.getHttpServer())
        .get('/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          // Validar que temos pelo menos 3 reembolsos
          expect(res.body.refunds.totalRefunds).toBeGreaterThanOrEqual(3);
          // Validar que a soma é maior que 0
          expect(res.body.refunds.totalAmount).toBeGreaterThan(0);
          // Validar que a média é maior que 0
          expect(res.body.refunds.averageAmount).toBeGreaterThan(0);
          // Validar que a média é total/quantidade
          expect(res.body.refunds.averageAmount).toBeCloseTo(
            res.body.refunds.totalAmount / res.body.refunds.totalRefunds,
          );
        });
    });
  });

  describe('GET /dashboard/refunds/report - Refund Report', () => {
    it('deve retornar relatório de reembolsos com autenticação', () => {
      return request(app.getHttpServer())
        .get('/dashboard/refunds/report')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);

          // Validar estrutura dos relatórios
          res.body.forEach((report: any) => {
            expect(report).toHaveProperty('id');
            expect(report).toHaveProperty('description');
            expect(report).toHaveProperty('amount');
            expect(report).toHaveProperty('status');
            expect(report).toHaveProperty('userId');
            expect(report).toHaveProperty('daysSinceCreation');
          });
        });
    });

    it('deve filtrar reembolsos por status PENDING', () => {
      return request(app.getHttpServer())
        .get('/dashboard/refunds/report?status=PENDING')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((report: any) => {
            expect(report.status).toBe(RefundStatus.PENDING);
          });
        });
    });
  });

  describe('GET /dashboard/refunds/by-status/* - Refunds by Status', () => {
    it('deve retornar reembolsos PENDING', () => {
      return request(app.getHttpServer())
        .get('/dashboard/refunds/by-status/pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((report: any) => {
            expect(report.status).toBe(RefundStatus.PENDING);
          });
        });
    });

    it('deve retornar reembolsos APPROVED (vazio inicialmente)', () => {
      return request(app.getHttpServer())
        .get('/dashboard/refunds/by-status/approved')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('deve retornar reembolsos REJECTED (vazio inicialmente)', () => {
      return request(app.getHttpServer())
        .get('/dashboard/refunds/by-status/rejected')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /dashboard/refunds/by-user/:userId - Refunds by User', () => {
    it('deve retornar reembolsos do usuário específico', () => {
      return request(app.getHttpServer())
        .get(`/dashboard/refunds/by-user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          res.body.forEach((report: any) => {
            expect(report.userId).toBe(userId);
          });
        });
    });

    it('deve retornar array vazio para usuário sem reembolsos', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'User Without Refunds',
          email: `no-refund-${Date.now()}@example.com`,
          password: 'senha123',
        })
        .then((res) => {
          const newUserId = res.body.id;
          return request(app.getHttpServer())
            .get(`/dashboard/refunds/by-user/${newUserId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200)
            .expect((refundsRes) => {
              expect(Array.isArray(refundsRes.body)).toBe(true);
              expect(refundsRes.body.length).toBe(0);
            });
        });
    });
  });

  describe('GET /dashboard/refunds/by-date-range - Refunds by Date Range', () => {
    it('deve retornar reembolsos dentro do intervalo de datas', () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 dias atrás
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Amanhã

      return request(app.getHttpServer())
        .get(
          `/dashboard/refunds/by-date-range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('deve retornar array vazio para intervalo sem reembolsos', () => {
      const startDate = new Date('2020-01-01');
      const endDate = new Date('2020-01-31');

      return request(app.getHttpServer())
        .get(
          `/dashboard/refunds/by-date-range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });
  });
});
