import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

describe('SkillsController', () => {
  let controller: SkillsController;
  let service: typeof mockSkillsService;

  const mockSkillsService = {
    createSkill: jest.fn(),
    findAllUserSkills: jest.fn(),
    findSkillById: jest.fn(),
    updateSkill: jest.fn(),
    deleteSkill: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [{ provide: SkillsService, useValue: mockSkillsService }],
    }).compile();

    controller = module.get<SkillsController>(SkillsController);
    service = module.get(SkillsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createSkill', async () => {
    const dto = { name: 'TypeScript' };
    (mockSkillsService.createSkill as any).mockResolvedValue({ id: 1, ...dto });

    const res = await controller.createSkill(1, dto);

    expect(service.createSkill).toHaveBeenCalledWith(1, dto);
    expect(res.name).toBe('TypeScript');
  });

  it('should call findAllUserSkills', async () => {
    (mockSkillsService.findAllUserSkills as any).mockResolvedValue([]);

    const res = await controller.findAllUserSkills(1);

    expect(service.findAllUserSkills).toHaveBeenCalledWith(1);
    expect(res).toEqual([]);
  });

  it('should call findSkillById', async () => {
    (mockSkillsService.findSkillById as any).mockResolvedValue({ id: 1 });

    const res = await controller.findSkillById(1, 1);

    expect(service.findSkillById).toHaveBeenCalledWith(1, 1);
    expect(res.id).toBe(1);
  });

  it('should call updateSkill', async () => {
    const dto = { progressPercentage: 100 };
    (mockSkillsService.updateSkill as any).mockResolvedValue({ id: 1, ...dto });

    const res = await controller.updateSkill(1, 1, dto);

    expect(service.updateSkill).toHaveBeenCalledWith(1, 1, dto);
    expect(res.progressPercentage).toBe(100);
  });

  it('should call deleteSkill', async () => {
    (mockSkillsService.deleteSkill as any).mockResolvedValue({ message: 'Deleted' });

    const res = await controller.deleteSkill(1, 1);

    expect(service.deleteSkill).toHaveBeenCalledWith(1, 1);
    expect(res.message).toBe('Deleted');
  });
});
