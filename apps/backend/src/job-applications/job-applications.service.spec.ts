import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { JobApplicationsService } from './job-applications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('JobApplicationsService', () => {
  let service: JobApplicationsService;

  const mockPrisma = {
    jobApplication: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobApplicationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<JobApplicationsService>(JobApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
