import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockPrisma = {
    task: { findMany: jest.fn().mockResolvedValue([]) },
    project: { findMany: jest.fn().mockResolvedValue([]) },
    jobApplication: { findMany: jest.fn().mockResolvedValue([]) },
    skill: { findMany: jest.fn().mockResolvedValue([]) },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate empty dashboard stats correctly', async () => {
    const stats = await service.getDashboardStats(1);
    expect(stats).toEqual({
      tasks: { total: 0, completed: 0, pending: 0, dailyTasksCount: 0 },
      projects: { total: 0, inProgress: 0, completed: 0 },
      jobApplications: { total: 0, applied: 0, interviews: 0, offers: 0 },
      skills: { total: 0, averageProgress: 0 },
    });
  });
});
