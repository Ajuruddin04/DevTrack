import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import * as bcrypt from 'bcryptjs';

describe('Auth Module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const testUser = {
    name: 'Auth E2E User',
    email: 'e2e_auth_user@example.com',
    password: 'securePassword123',
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

    // Clean up test user if exists
    await prisma.user.deleteMany({
      where: { email: { contains: 'e2e_auth_' } },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'e2e_auth_' } },
    });
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should successfully register a new user and return a JWT access token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.name).toBe(testUser.name);

      // Verify password is NEVER returned in response
      expect(res.body.user.password).toBeUndefined();

      // Verify password in database IS hashed
      const dbUser = await prisma.user.findUnique({
        where: { email: testUser.email },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.password).not.toBe(testUser.password);
      const isMatch = await bcrypt.compare(testUser.password, dbUser!.password);
      expect(isMatch).toBe(true);
    });

    it('should reject duplicate email registration with 409 Conflict', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);

      expect(res.body.message).toContain('already exists');
    });

    it('should reject invalid email format with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Invalid Email User',
          email: 'not-an-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should reject short password (< 6 characters) with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Short Password User',
          email: 'e2e_auth_short@example.com',
          password: '123',
        })
        .expect(400);
    });

    it('should reject missing required fields with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'e2e_auth_missing@example.com',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should successfully log in with valid credentials and return JWT token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.password).toBeUndefined();
    });

    it('should reject incorrect password with 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongPassword123',
        })
        .expect(401);

      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should reject non-existent email with 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent_user_12345@example.com',
          password: 'somePassword123',
        })
        .expect(401);

      expect(res.body.message).toBe('Invalid email or password');
    });
  });

  describe('Protected Routes (GET /auth/me)', () => {
    let validToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      validToken = res.body.accessToken;
    });

    it('should allow access with valid JWT Bearer token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(res.body.email).toBe(testUser.email);
      expect(res.body.password).toBeUndefined();
    });

    it('should reject requests without JWT token with 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should reject requests with invalid / garbage JWT token with 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid_garbage_token_string')
        .expect(401);
    });

    it('should reject requests with malformed Authorization header with 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Basic invalid_basic_auth')
        .expect(401);
    });
  });
});
