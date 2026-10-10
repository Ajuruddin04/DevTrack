import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Validation, CRUD & Error Handling E2E (Phases 11 - 13)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let authToken: string;

  const validUserData = {
    name: 'Validation Tester',
    email: 'e2e_val_user@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    await prisma.user.deleteMany({
      where: { email: { contains: 'e2e_val_' } },
    });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(validUserData);
    authToken = res.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'e2e_val_' } },
    });
    await app.close();
  });

  describe('PHASE 11 — DTO Validation & Whitelisting Rules', () => {
    it('should reject requests with unexpected/non-whitelisted fields (forbidNonWhitelisted)', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Valid Task',
          unknownField: 'malicious payload',
        })
        .expect(400);

      expect(res.body.message).toContain('property unknownField should not exist');
    });

    it('should reject invalid enum values in task creation', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Status Task',
          status: 'NOT_A_VALID_STATUS',
        })
        .expect(400);
    });

    it('should reject invalid URL string in project creation', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Bad URL Project',
          repoUrl: 'not-a-valid-url',
        })
        .expect(400);
    });

    it('should reject progressPercentage > 100 in skill creation', async () => {
      await request(app.getHttpServer())
        .post('/skills')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Over-skilled',
          progressPercentage: 150,
        })
        .expect(400);
    });

    it('should reject progressPercentage < 0 in skill creation', async () => {
      await request(app.getHttpServer())
        .post('/skills')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Under-skilled',
          progressPercentage: -10,
        })
        .expect(400);
    });

    it('should reject non-numeric string for ID parameter (ParseIntPipe)', async () => {
      await request(app.getHttpServer())
        .get('/tasks/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PHASE 12 — Complete Lifecycle CRUD Verification', () => {
    let createdTaskId: number;

    it('1. CREATE task', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'CRUD Lifecycle Task' })
        .expect(201);

      createdTaskId = res.body.id;
      expect(res.body.title).toBe('CRUD Lifecycle Task');
    });

    it('2. READ ALL tasks', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((t: any) => t.id === createdTaskId)).toBe(true);
    });

    it('3. READ ONE task', async () => {
      const res = await request(app.getHttpServer())
        .get(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe(createdTaskId);
    });

    it('4. UPDATE task', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'CRUD Lifecycle Task Updated' })
        .expect(200);

      expect(res.body.title).toBe('CRUD Lifecycle Task Updated');
    });

    it('5. DELETE task & verify in database', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const dbCheck = await prisma.task.findUnique({ where: { id: createdTaskId } });
      expect(dbCheck).toBeNull();
    });
  });

  describe('PHASE 13 — Standardized Error Handling & Response Format', () => {
    it('Non-existent resource returns structured 404 response without leaking stack traces', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks/9999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(res.body).toHaveProperty('statusCode', 404);
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('path');
      expect(res.body.stack).toBeUndefined();
    });

    it('Duplicate resource conflict returns 409 response', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validUserData)
        .expect(409);
    });

    it('Unauthorized request returns structured 401 response', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });
});
