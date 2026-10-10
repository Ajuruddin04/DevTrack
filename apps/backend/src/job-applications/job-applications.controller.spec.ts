import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplicationsService } from './job-applications.service';

describe('JobApplicationsController', () => {
  let controller: JobApplicationsController;
  let service: typeof mockJobApplicationsService;

  const mockJobApplicationsService = {
    createJobApplication: jest.fn(),
    findAllUserJobApplications: jest.fn(),
    findJobApplicationById: jest.fn(),
    updateJobApplication: jest.fn(),
    deleteJobApplication: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobApplicationsController],
      providers: [
        { provide: JobApplicationsService, useValue: mockJobApplicationsService },
      ],
    }).compile();

    controller = module.get<JobApplicationsController>(JobApplicationsController);
    service = module.get(JobApplicationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createJobApplication', async () => {
    const dto = { company: 'Acme', role: 'Dev' };
    (mockJobApplicationsService.createJobApplication as any).mockResolvedValue({ id: 1, ...dto });

    const res = await controller.createJobApplication(1, dto);

    expect(service.createJobApplication).toHaveBeenCalledWith(1, dto);
    expect(res.company).toBe('Acme');
  });

  it('should call findAllUserJobApplications', async () => {
    (mockJobApplicationsService.findAllUserJobApplications as any).mockResolvedValue([]);

    const res = await controller.findAllUserJobApplications(1);

    expect(service.findAllUserJobApplications).toHaveBeenCalledWith(1);
    expect(res).toEqual([]);
  });

  it('should call findJobApplicationById', async () => {
    (mockJobApplicationsService.findJobApplicationById as any).mockResolvedValue({ id: 1 });

    const res = await controller.findJobApplicationById(1, 1);

    expect(service.findJobApplicationById).toHaveBeenCalledWith(1, 1);
    expect(res.id).toBe(1);
  });

  it('should call updateJobApplication', async () => {
    const dto = { company: 'New Company' };
    (mockJobApplicationsService.updateJobApplication as any).mockResolvedValue({ id: 1, ...dto });

    const res = await controller.updateJobApplication(1, 1, dto);

    expect(service.updateJobApplication).toHaveBeenCalledWith(1, 1, dto);
    expect(res.company).toBe('New Company');
  });

  it('should call deleteJobApplication', async () => {
    (mockJobApplicationsService.deleteJobApplication as any).mockResolvedValue({ message: 'Deleted' });

    const res = await controller.deleteJobApplication(1, 1);

    expect(service.deleteJobApplication).toHaveBeenCalledWith(1, 1);
    expect(res.message).toBe('Deleted');
  });
});
