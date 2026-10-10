import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TaskPriority, TaskStatus, ProjectStatus, JobApplicationStatus, SkillProficiency } from '../src/generated/prisma/client';

describe('Ownership & Module E2E Tests (Phases 6 - 10)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let tokenUserA: string;
  let userIdA: number;
  let tokenUserB: string;
  let userIdB: number;
  let tokenUserC: string;
  let _userIdC: number;

  const userAData = {
    name: 'User A',
    email: 'e2e_owner_usera@example.com',
    password: 'passwordUserA123',
  };

  const userBData = {
    name: 'User B',
    email: 'e2e_owner_userb@example.com',
    password: 'passwordUserB123',
  };

  const userCData = {
    name: 'User C (Empty Data)',
    email: 'e2e_owner_userc@example.com',
    password: 'passwordUserC123',
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

    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'e2e_owner_' } },
    });

    // Register User A
    const resA = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userAData);
    tokenUserA = resA.body.accessToken;
    userIdA = resA.body.user.id;

    // Register User B
    const resB = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userBData);
    tokenUserB = resB.body.accessToken;
    userIdB = resB.body.user.id;

    // Register User C
    const resC = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userCData);
    tokenUserC = resC.body.accessToken;
    _userIdC = resC.body.user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'e2e_owner_' } },
    });
    await app.close();
  });

  describe('PHASE 6 — Tasks Ownership & Access Control', () => {
    let taskAId: number;

    it('User A creates Task A successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: "User A's Private Task",
          description: "Top secret task for User A",
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
        })
        .expect(201);

      taskAId = res.body.id;
      expect(res.body.userId).toBe(userIdA);
      expect(res.body.title).toBe("User A's Private Task");
    });

    it('User A can GET Task A', async () => {
      const res = await request(app.getHttpServer())
        .get(`/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .expect(200);

      expect(res.body.id).toBe(taskAId);
    });

    it('User A can PATCH Task A', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ title: "User A's Updated Task Title", status: TaskStatus.IN_PROGRESS })
        .expect(200);

      expect(res.body.title).toBe("User A's Updated Task Title");
      expect(res.body.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('User B CANNOT GET Task A (404 Not Found)', async () => {
      await request(app.getHttpServer())
        .get(`/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .expect(404);
    });

    it('User B CANNOT PATCH Task A (404 Not Found)', async () => {
      await request(app.getHttpServer())
        .patch(`/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ title: "Hacked by User B" })
        .expect(404);

      // Verify in DB that Task A was NOT changed by User B
      const dbTask = await prisma.task.findUnique({ where: { id: taskAId } });
      expect(dbTask?.title).toBe("User A's Updated Task Title");
    });

    it('User B CANNOT DELETE Task A (404 Not Found)', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .expect(404);

      // Verify in DB Task A still exists
      const dbTask = await prisma.task.findUnique({ where: { id: taskAId } });
      expect(dbTask).not.toBeNull();
    });

    it('User B GET /tasks does NOT include User A task', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${tokenUserB}`)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('User A can DELETE Task A', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .expect(200);

      // Verify DB deletion
      const dbTask = await prisma.task.findUnique({ where: { id: taskAId } });
      expect(dbTask).toBeNull();
    });
  });

  describe('PHASE 7 — Projects Module & Progress Calculations', () => {
    let projectAId: number;
    let linkedTaskId: number;

    it('User A creates Project A', async () => {
      const res = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          name: "User A's Portfolio Web Application",
          description: "Fullstack NestJS and React project",
          status: ProjectStatus.IN_PROGRESS,
          techStack: ['NestJS', 'TypeScript', 'Prisma'],
          repoUrl: 'https://github.com/usera/portfolio',
        })
        .expect(201);

      projectAId = res.body.id;
      expect(res.body.userId).toBe(userIdA);
      expect(res.body.name).toBe("User A's Portfolio Web Application");
    });

    it('User A links a task to Project A and verifies initial progress percentage (0%)', async () => {
      const taskRes = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          title: 'Implement Database Schema',
          status: TaskStatus.TODO,
          projectId: projectAId,
        })
        .expect(201);

      linkedTaskId = taskRes.body.id;

      const projRes = await request(app.getHttpServer())
        .get(`/projects/${projectAId}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .expect(200);

      expect(projRes.body.totalTasks).toBe(1);
      expect(projRes.body.completedTasks).toBe(0);
      expect(projRes.body.progressPercentage).toBe(0);
    });

    it('Completing the linked task updates Project A progress percentage to 100%', async () => {
      await request(app.getHttpServer())
        .patch(`/tasks/${linkedTaskId}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ status: TaskStatus.COMPLETED })
        .expect(200);

      const projRes = await request(app.getHttpServer())
        .get(`/projects/${projectAId}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .expect(200);

      expect(projRes.body.totalTasks).toBe(1);
      expect(projRes.body.completedTasks).toBe(1);
      expect(projRes.body.progressPercentage).toBe(100);
    });

    it('User B CANNOT access User A Project (GET 404)', async () => {
      await request(app.getHttpServer())
        .get(`/projects/${projectAId}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .expect(404);
    });

    it('User B CANNOT update User A Project (PATCH 404)', async () => {
      await request(app.getHttpServer())
        .patch(`/projects/${projectAId}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ name: 'User B Hijack' })
        .expect(404);
    });

    it('User B CANNOT delete User A Project (DELETE 404)', async () => {
      await request(app.getHttpServer())
        .delete(`/projects/${projectAId}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .expect(404);
    });
  });

  describe('PHASE 8 — Job Applications Module', () => {
    let jobAppId: number;

    it('User A creates a Job Application', async () => {
      const res = await request(app.getHttpServer())
        .post('/job-applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          company: 'Acme Software',
          role: 'Backend Engineer',
          location: 'Remote',
          salary: '$120,000',
          status: JobApplicationStatus.APPLIED,
          notes: 'Applied via company site',
          jobUrl: 'https://acme.com/jobs/123',
        })
        .expect(201);

      jobAppId = res.body.id;
      expect(res.body.userId).toBe(userIdA);
      expect(res.body.company).toBe('Acme Software');
    });

    it('User A can GET all their job applications', async () => {
      const res = await request(app.getHttpServer())
        .get('/job-applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].company).toBe('Acme Software');
    });

    it('User A can update the job application status to INTERVIEW', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/job-applications/${jobAppId}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ status: JobApplicationStatus.INTERVIEW, notes: 'Interview scheduled for next Tuesday' })
        .expect(200);

      expect(res.body.status).toBe(JobApplicationStatus.INTERVIEW);
    });

    it('User B CANNOT view User A job application (GET 404)', async () => {
      await request(app.getHttpServer())
        .get(`/job-applications/${jobAppId}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .expect(404);
    });

    it('User B CANNOT edit User A job application (PATCH 404)', async () => {
      await request(app.getHttpServer())
        .patch(`/job-applications/${jobAppId}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ company: 'Malicious Change' })
        .expect(404);
    });

    it('User B CANNOT delete User A job application (DELETE 404)', async () => {
      await request(app.getHttpServer())
        .delete(`/job-applications/${jobAppId}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .expect(404);
    });
  });

  describe('PHASE 9 — Skills Module & Per-User Uniqueness', () => {
    let skillIdA: number;

    it('User A creates Skill "NestJS"', async () => {
      const res = await request(app.getHttpServer())
        .post('/skills')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          name: 'NestJS',
          category: 'Backend',
          proficiency: SkillProficiency.ADVANCED,
          progressPercentage: 85,
        })
        .expect(201);

      skillIdA = res.body.id;
      expect(res.body.userId).toBe(userIdA);
      expect(res.body.name).toBe('NestJS');
    });

    it('User A trying to create duplicate Skill "NestJS" fails with 409 Conflict', async () => {
      await request(app.getHttpServer())
        .post('/skills')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          name: 'NestJS',
          category: 'Backend Framework',
        })
        .expect(409);
    });

    it('User B CAN create Skill "NestJS" (unique constraint is per-user)', async () => {
      const res = await request(app.getHttpServer())
        .post('/skills')
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({
          name: 'NestJS',
          category: 'Backend',
          proficiency: SkillProficiency.BEGINNER,
          progressPercentage: 30,
        })
        .expect(201);

      expect(res.body.userId).toBe(userIdB);
      expect(res.body.name).toBe('NestJS');
    });

    it('User B CANNOT view User A Skill (GET 404)', async () => {
      await request(app.getHttpServer())
        .get(`/skills/${skillIdA}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .expect(404);
    });

    it('User B CANNOT update User A Skill (PATCH 404)', async () => {
      await request(app.getHttpServer())
        .patch(`/skills/${skillIdA}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ progressPercentage: 0 })
        .expect(404);
    });

    it('User B CANNOT delete User A Skill (DELETE 404)', async () => {
      await request(app.getHttpServer())
        .delete(`/skills/${skillIdA}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .expect(404);
    });
  });

  describe('PHASE 10 — Dashboard Aggregations & Data Isolation', () => {
    it("User A dashboard reflects only User A's statistics", async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .expect(200);

      expect(res.body.tasks.total).toBeGreaterThanOrEqual(1);
      expect(res.body.projects.total).toBeGreaterThanOrEqual(1);
      expect(res.body.jobApplications.total).toBeGreaterThanOrEqual(1);
      expect(res.body.skills.total).toBeGreaterThanOrEqual(1);
      expect(res.body.skills.averageProgress).toBe(85);
    });

    it("User B dashboard reflects only User B's statistics", async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${tokenUserB}`)
        .expect(200);

      expect(res.body.tasks.total).toBe(0);
      expect(res.body.projects.total).toBe(0);
      expect(res.body.jobApplications.total).toBe(0);
      expect(res.body.skills.total).toBe(1);
      expect(res.body.skills.averageProgress).toBe(30);
    });

    it('User C dashboard (zero data) returns zeroed stats gracefully without errors', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${tokenUserC}`)
        .expect(200);

      expect(res.body).toEqual({
        tasks: { total: 0, completed: 0, pending: 0, dailyTasksCount: 0 },
        projects: { total: 0, inProgress: 0, completed: 0 },
        jobApplications: { total: 0, applied: 0, interviews: 0, offers: 0 },
        skills: { total: 0, averageProgress: 0 },
      });
    });
  });
});
