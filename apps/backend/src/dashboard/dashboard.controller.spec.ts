import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: typeof mockDashboardService;

  const mockDashboardService = {
    getDashboardStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockDashboardService }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getDashboardStats on service', async () => {
    const mockStats = {
      tasks: { total: 5, completed: 2, pending: 3, dailyTasksCount: 1 },
      projects: { total: 2, inProgress: 1, completed: 1 },
      jobApplications: { total: 3, applied: 1, interviews: 1, offers: 1 },
      skills: { total: 4, averageProgress: 75 },
    };

    (mockDashboardService.getDashboardStats as any).mockResolvedValue(mockStats);

    const res = await controller.getDashboardStats(1);

    expect(service.getDashboardStats).toHaveBeenCalledWith(1);
    expect(res).toEqual(mockStats);
  });
});
