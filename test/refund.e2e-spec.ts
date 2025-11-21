import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/infrastructure/nestjs/module/app.module';
import { RefundStatus } from '../src/entity/refund/refund.entity';

describe('RefundController (e2e)', () => {
  let app: INestApplication<App>;
  let userId: string;
  let createdRefundId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Criar um usuário para os testes
    const userRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Usuario Refund Test',
        email: `refund-${Date.now()}@example.com`,
        password: 'senha123',
      });
    userId = userRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /refunds - Criar reembolso', () => {
    it('deve criar um novo reembolso com dados válidos', () => {
      return request(app.getHttpServer())
        .post('/refunds')
        .send({
          description: 'Reembolso por erro no pedido',
          amount: 150.50,
          userId: userId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('description', 'Reembolso por erro no pedido');
          expect(res.body).toHaveProperty('amount');
          expect(res.body).toHaveProperty('status', RefundStatus.PENDING);
          expect(res.body).toHaveProperty('userId', userId);
          createdRefundId = res.body.id;
        });
    });

    it('deve retornar erro 400 sem descrição', () => {
      return request(app.getHttpServer())
        .post('/refunds')
        .send({
          amount: 100,
          userId: userId,
        })
        .expect(400);
    });

    it('deve retornar erro 400 com valor zero', () => {
      return request(app.getHttpServer())
        .post('/refunds')
        .send({
          description: 'Teste',
          amount: 0,
          userId: userId,
        })
        .expect(400);
    });

    it('deve retornar erro 400 sem usuário', () => {
      return request(app.getHttpServer())
        .post('/refunds')
        .send({
          description: 'Teste',
          amount: 100,
        })
        .expect(400);
    });

    it('deve retornar erro 400 com userId inválido', () => {
      return request(app.getHttpServer())
        .post('/refunds')
        .send({
          description: 'Teste',
          amount: 100,
          userId: 'invalid-uuid',
        })
        .expect(400);
    });

    it('deve retornar erro 400 com usuário inexistente', () => {
      return request(app.getHttpServer())
        .post('/refunds')
        .send({
          description: 'Teste',
          amount: 100,
          userId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(400);
    });
  });

  describe('GET /refunds - Listar reembolsos', () => {
    it('deve listar todos os reembolsos', () => {
      return request(app.getHttpServer())
        .get('/refunds')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /refunds/:id - Buscar reembolso por ID', () => {
    it('deve buscar reembolso por ID', () => {
      return request(app.getHttpServer())
        .get(`/refunds/${createdRefundId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdRefundId);
          expect(res.body).toHaveProperty('userId', userId);
        });
    });

    it('deve retornar 404 para ID inválido', () => {
      return request(app.getHttpServer())
        .get('/refunds/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('GET /refunds/user/:userId - Listar reembolsos por usuário', () => {
    it('deve listar reembolsos do usuário', () => {
      return request(app.getHttpServer())
        .get(`/refunds/user/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('userId', userId);
        });
    });

    it('deve retornar array vazio para usuário sem reembolsos', () => {
      // Criar um novo usuário sem reembolsos
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Usuario Sem Refund',
          email: `no-refund-${Date.now()}@example.com`,
          password: 'senha123',
        })
        .then((res) => {
          const newUserId = res.body.id;
          return request(app.getHttpServer())
            .get(`/refunds/user/${newUserId}`)
            .expect(200)
            .expect((refundsRes) => {
              expect(Array.isArray(refundsRes.body)).toBe(true);
              expect(refundsRes.body.length).toBe(0);
            });
        });
    });
  });

  describe('PUT /refunds/:id - Atualizar reembolso', () => {
    let refundToUpdate: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/refunds')
        .send({
          description: 'Reembolso para atualizar',
          amount: 200,
          userId: userId,
        });
      refundToUpdate = res.body.id;
    });

    it('deve atualizar descrição do reembolso', () => {
      return request(app.getHttpServer())
        .put(`/refunds/${refundToUpdate}`)
        .send({ description: 'Descrição atualizada' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('description', 'Descrição atualizada');
        });
    });

    it('deve atualizar valor do reembolso', () => {
      return request(app.getHttpServer())
        .put(`/refunds/${refundToUpdate}`)
        .send({ amount: 350.75 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('amount');
        });
    });

    it('deve atualizar status do reembolso', () => {
      return request(app.getHttpServer())
        .put(`/refunds/${refundToUpdate}`)
        .send({ status: RefundStatus.APPROVED })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', RefundStatus.APPROVED);
        });
    });

    it('deve retornar erro 400 com status inválido', () => {
      return request(app.getHttpServer())
        .put(`/refunds/${refundToUpdate}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('deve retornar erro 404 para ID inválido', () => {
      return request(app.getHttpServer())
        .put('/refunds/00000000-0000-0000-0000-000000000000')
        .send({ description: 'Novo' })
        .expect(404);
    });
  });

  describe('DELETE /refunds/:id - Deletar reembolso', () => {
    let refundToDelete: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/refunds')
        .send({
          description: 'Reembolso para deletar',
          amount: 100,
          userId: userId,
        });
      refundToDelete = res.body.id;
    });

    it('deve deletar reembolso com sucesso', () => {
      return request(app.getHttpServer())
        .delete(`/refunds/${refundToDelete}`)
        .expect(204);
    });

    it('deve retornar erro 404 para ID inválido', () => {
      return request(app.getHttpServer())
        .delete('/refunds/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('não deve encontrar reembolso após deletar', () => {
      return request(app.getHttpServer())
        .get(`/refunds/${refundToDelete}`)
        .expect(404);
    });
  });
});
