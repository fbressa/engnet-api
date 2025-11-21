import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/infrastructure/nestjs/module/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;
  let createdUserId: string;
  let authToken: string;
  const uniqueEmail = `joao-${Date.now()}@example.com`; // Email único para cada teste

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users - Criar usuário', () => {
    it('deve criar um novo usuário com dados válidos', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'João Silva',
          email: uniqueEmail,
          password: 'senha123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'João Silva');
          expect(res.body).toHaveProperty('email', uniqueEmail);
          expect(res.body).not.toHaveProperty('password'); // Não deve retornar a senha
          createdUserId = res.body.id;
        });
    });

    it('deve retornar erro 400 com email inválido', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Maria Silva',
          email: 'email-invalido',
          password: 'senha123',
        })
        .expect(400);
    });

    it('deve retornar erro 400 com senha menor que 6 caracteres', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Pedro Santos',
          email: `pedro-${Date.now()}@example.com`,
          password: '123',
        })
        .expect(400);
    });

    it('deve retornar erro 400 sem nome', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: 'senha123',
        })
        .expect(400);
    });

    it('deve retornar erro 409 se email já existe', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Outro João',
          email: uniqueEmail, // Mesmo email do primeiro usuário
          password: 'senha123',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login - Fazer login', () => {
    it('deve fazer login com credenciais válidas', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: uniqueEmail,
          password: 'senha123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          authToken = res.body.accessToken;
        });
    });

    it('deve retornar erro 401 com senha incorreta', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: uniqueEmail,
          password: 'senhaErrada',
        })
        .expect(401);
    });
  });

  describe('GET /users - Listar usuários', () => {
    it('deve retornar erro 401 sem autenticação', () => {
      return request(app.getHttpServer()).get('/users').expect(401);
    });

    it('deve listar todos os usuários com autenticação', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /users/:id - Buscar usuário por ID', () => {
    it('deve retornar erro 401 sem autenticação', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(401);
    });

    it('deve buscar usuário por ID com autenticação', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdUserId);
          expect(res.body).toHaveProperty('email', uniqueEmail);
        });
    });

    it('deve retornar null para ID inválido', () => {
      return request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
