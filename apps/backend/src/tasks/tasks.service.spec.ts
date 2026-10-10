import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { TaskPriority, TaskStatus } from '../generated/prisma/client';

describe('TasksService', () => {
  let service: TasksService;
  let _prisma: PrismaService;

  const mockPrisma = {
    task: {
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
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    _prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a task for a user', async () => {
    const dto = {
      title: 'Test Task',
      description: 'Desc',
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
    };
    const createdTask = { id: 1, ...dto, userId: 1, createdAt: new Date(), updatedAt: new Date() };
    (mockPrisma.task.create as any).mockResolvedValue(createdTask);

    const result = await service.createTask(1, dto as any);
    expect(result).toEqual(createdTask);
  });

  it('should throw NotFoundException if task does not belong to user', async () => {
    (mockPrisma.task.findFirst as any).mockResolvedValue(null);

    await expect(service.findTaskById(1, 999)).rejects.toThrow(NotFoundException);
  });
});
