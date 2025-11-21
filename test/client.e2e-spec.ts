import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/infrastructure/nestjs/module/app.module';

describe('ClientController (e2e)', () => {
  let app: INestApplication<App>;
  let createdClientId: string;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login para obter token JWT
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'test123456',
      })
      .catch(() => {
        // Se falhar, criar um usuário e fazer login
        return request(app.getHttpServer())
          .post('/users')
          .send({
            name: 'Test User',
            email: 'test@example.com',
            password: 'test123456',
          })
          .then(() => {
            return request(app.getHttpServer())
              .post('/auth/login')
              .send({
                email: 'test@example.com',
                password: 'test123456',
              });
          });
      });

    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /clients - Criar cliente', () => {
    it('deve criar um novo cliente com dados válidos', () => {
      return request(app.getHttpServer())
        .post('/clients')
        .send({
          companyName: 'Tech Solutions Inc',
          contactPerson: 'João Manager',
          cnpj: '12.345.678/0001-90',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('companyName', 'Tech Solutions Inc');
          expect(res.body).toHaveProperty('contactPerson', 'João Manager');
          createdClientId = res.body.id;
        });
    });

    it('deve criar cliente sem CNPJ (opcional)', () => {
      return request(app.getHttpServer())
        .post('/clients')
        .send({
          companyName: 'Simple Business',
          contactPerson: 'Maria Silva',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('companyName', 'Simple Business');
        });
    });

    it('deve retornar erro 400 sem nome da empresa', () => {
      return request(app.getHttpServer())
        .post('/clients')
        .send({
          contactPerson: 'João Manager',
          cnpj: '12.345.678/0001-90',
        })
        .expect(400);
    });

    it('deve retornar erro 400 sem nome do responsável', () => {
      return request(app.getHttpServer())
        .post('/clients')
        .send({
          companyName: 'Tech Solutions',
          cnpj: '12.345.678/0001-90',
        })
        .expect(400);
    });

    it('deve retornar erro 400 com CNPJ inválido', () => {
      return request(app.getHttpServer())
        .post('/clients')
        .send({
          companyName: 'Tech Solutions',
          contactPerson: 'João Manager',
          cnpj: '123', // Muito curto
        })
        .expect(400);
    });
  });

  describe('GET /clients - Listar clientes', () => {
    it('deve listar todos os clientes', () => {
      return request(app.getHttpServer())
        .get('/clients')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /clients/:id - Buscar cliente por ID', () => {
    it('deve buscar cliente por ID', () => {
      return request(app.getHttpServer())
        .get(`/clients/${createdClientId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdClientId);
          expect(res.body).toHaveProperty('companyName', 'Tech Solutions Inc');
        });
    });

    it('deve retornar 404 para ID inválido', () => {
      return request(app.getHttpServer())
        .get('/clients/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PUT /clients/:id - Atualizar cliente', () => {
    it('deve atualizar nome da empresa', () => {
      return request(app.getHttpServer())
        .put(`/clients/${createdClientId}`)
        .send({ companyName: 'Tech Solutions Updated' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('companyName', 'Tech Solutions Updated');
        });
    });

    it('deve atualizar nome do responsável', () => {
      return request(app.getHttpServer())
        .put(`/clients/${createdClientId}`)
        .send({ contactPerson: 'Pedro Silva' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('contactPerson', 'Pedro Silva');
        });
    });

    it('deve atualizar CNPJ', () => {
      return request(app.getHttpServer())
        .put(`/clients/${createdClientId}`)
        .send({ cnpj: '98.765.432/0001-12' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('cnpj', '98.765.432/0001-12');
        });
    });

    it('deve retornar erro 400 com CNPJ inválido', () => {
      return request(app.getHttpServer())
        .put(`/clients/${createdClientId}`)
        .send({ cnpj: 'invalid' })
        .expect(400);
    });

    it('deve retornar erro 404 para ID inválido', () => {
      return request(app.getHttpServer())
        .put('/clients/00000000-0000-0000-0000-000000000000')
        .send({ companyName: 'New Name' })
        .expect(404);
    });
  });

  describe('DELETE /clients/:id - Deletar cliente', () => {
    let clientToDelete: string;

    beforeAll(async () => {
      // Criar um cliente para ser deletado
      const res = await request(app.getHttpServer())
        .post('/clients')
        .send({
          companyName: 'Cliente Para Deletar',
          contactPerson: 'Responsável',
          cnpj: '11.111.111/0001-11',
        });
      clientToDelete = res.body.id;
    });

    it('deve deletar cliente com sucesso', () => {
      return request(app.getHttpServer())
        .delete(`/clients/${clientToDelete}`)
        .expect(204);
    });

    it('deve retornar erro 404 para ID inválido', () => {
      return request(app.getHttpServer())
        .delete('/clients/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('não deve encontrar cliente após deletar', () => {
      return request(app.getHttpServer())
        .get(`/clients/${clientToDelete}`)
        .expect(404);
    });
  });
});
