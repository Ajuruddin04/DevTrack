import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: typeof mockProjectsService;

  const mockProjectsService = {
    createProject: jest.fn(),
    findAllUserProjects: jest.fn(),
    findProjectById: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [{ provide: ProjectsService, useValue: mockProjectsService }],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createProject on service', async () => {
    const dto = { name: 'New Project' };
    (mockProjectsService.createProject as any).mockResolvedValue({ id: 1, ...dto });

    const res = await controller.createProject(1, dto);

    expect(service.createProject).toHaveBeenCalledWith(1, dto);
    expect(res.name).toBe('New Project');
  });

  it('should call findAllUserProjects on service', async () => {
    (mockProjectsService.findAllUserProjects as any).mockResolvedValue([]);

    const res = await controller.findAllUserProjects(1);

    expect(service.findAllUserProjects).toHaveBeenCalledWith(1);
    expect(res).toEqual([]);
  });

  it('should call findProjectById on service', async () => {
    (mockProjectsService.findProjectById as any).mockResolvedValue({ id: 1, name: 'Project' });

    const res = await controller.findProjectById(1, 1);

    expect(service.findProjectById).toHaveBeenCalledWith(1, 1);
    expect(res.name).toBe('Project');
  });

  it('should call updateProject on service', async () => {
    const dto = { name: 'Updated' };
    (mockProjectsService.updateProject as any).mockResolvedValue({ id: 1, name: 'Updated' });

    const res = await controller.updateProject(1, 1, dto);

    expect(service.updateProject).toHaveBeenCalledWith(1, 1, dto);
    expect(res.name).toBe('Updated');
  });

  it('should call deleteProject on service', async () => {
    (mockProjectsService.deleteProject as any).mockResolvedValue({ message: 'Deleted' });

    const res = await controller.deleteProject(1, 1);

    expect(service.deleteProject).toHaveBeenCalledWith(1, 1);
    expect(res.message).toBe('Deleted');
  });
});
