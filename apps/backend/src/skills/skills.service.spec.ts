import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from './skills.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SkillsService', () => {
  let service: SkillsService;

  const mockPrisma = {
    skill: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
