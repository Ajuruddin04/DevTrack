import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskPriority, TaskStatus } from '../generated/prisma/client';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: typeof mockTasksService;

  const mockTasksService = {
    createTask: jest.fn(),
    findAllUserTasks: jest.fn(),
    findTaskById: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createTask on service', async () => {
    const dto = { title: 'Test Task', status: TaskStatus.TODO, priority: TaskPriority.HIGH };
    (mockTasksService.createTask as any).mockResolvedValue({ id: 1, ...dto, userId: 1 });

    const res = await controller.createTask(1, dto);

    expect(tasksService.createTask).toHaveBeenCalledWith(1, dto);
    expect(res).toHaveProperty('id', 1);
  });

  it('should call findAllUserTasks on service', async () => {
    const query = { status: TaskStatus.TODO };
    (mockTasksService.findAllUserTasks as any).mockResolvedValue([]);

    const res = await controller.findAllUserTasks(1, query);

    expect(tasksService.findAllUserTasks).toHaveBeenCalledWith(1, query);
    expect(res).toEqual([]);
  });

  it('should call findTaskById on service', async () => {
    (mockTasksService.findTaskById as any).mockResolvedValue({ id: 1, title: 'Task' });

    const res = await controller.findTaskById(1, 1);

    expect(tasksService.findTaskById).toHaveBeenCalledWith(1, 1);
    expect(res).toEqual({ id: 1, title: 'Task' });
  });

  it('should call updateTask on service', async () => {
    const updateDto = { title: 'Updated' };
    (mockTasksService.updateTask as any).mockResolvedValue({ id: 1, title: 'Updated' });

    const res = await controller.updateTask(1, 1, updateDto);

    expect(tasksService.updateTask).toHaveBeenCalledWith(1, 1, updateDto);
    expect(res.title).toBe('Updated');
  });

  it('should call deleteTask on service', async () => {
    (mockTasksService.deleteTask as any).mockResolvedValue({ message: 'Deleted' });

    const res = await controller.deleteTask(1, 1);

    expect(tasksService.deleteTask).toHaveBeenCalledWith(1, 1);
    expect(res.message).toBe('Deleted');
  });
});
