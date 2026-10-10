import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';

@Injectable()
export class JobApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createJobApplication(
    userId: number,
    createDto: CreateJobApplicationDto,
  ) {
    return this.prisma.jobApplication.create({
      data: {
        company: createDto.company,
        role: createDto.role,
        location: createDto.location,
        salary: createDto.salary,
        status: createDto.status,
        applicationDate: createDto.applicationDate
          ? new Date(createDto.applicationDate)
          : new Date(),
        interviewDate: createDto.interviewDate
          ? new Date(createDto.interviewDate)
          : null,
        notes: createDto.notes,
        jobUrl: createDto.jobUrl,
        userId,
      },
    });
  }

  async findAllUserJobApplications(userId: number) {
    return this.prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findJobApplicationById(userId: number, id: number) {
    const jobApp = await this.prisma.jobApplication.findFirst({
      where: { id, userId },
    });

    if (!jobApp) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }

    return jobApp;
  }

  async updateJobApplication(
    userId: number,
    id: number,
    updateDto: UpdateJobApplicationDto,
  ) {
    await this.findJobApplicationById(userId, id);

    const data: any = Object.assign({}, updateDto);
    if (updateDto.applicationDate) {
      data.applicationDate = new Date(updateDto.applicationDate);
    }
    if (updateDto.interviewDate) {
      data.interviewDate = new Date(updateDto.interviewDate);
    }

    return this.prisma.jobApplication.update({
      where: { id },
      data,
    });
  }

  async deleteJobApplication(userId: number, id: number) {
    await this.findJobApplicationById(userId, id);

    await this.prisma.jobApplication.delete({
      where: { id },
    });

    return { message: `Job application with ID ${id} successfully deleted` };
  }
}
