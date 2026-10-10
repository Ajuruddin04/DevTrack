import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(userId: number, createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description: createProjectDto.description,
        status: createProjectDto.status,
        techStack: createProjectDto.techStack ?? [],
        repoUrl: createProjectDto.repoUrl,
        liveUrl: createProjectDto.liveUrl,
        userId,
      },
    });
  }

  async findAllUserProjects(userId: number) {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((project) => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter(
        (t) => t.status === 'COMPLETED',
      ).length;
      const progressPercentage =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...project,
        totalTasks,
        completedTasks,
        progressPercentage,
      };
    });
  }

  async findProjectById(userId: number, id: number) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        tasks: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(
      (t) => t.status === 'COMPLETED',
    ).length;
    const progressPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...project,
      totalTasks,
      completedTasks,
      progressPercentage,
    };
  }

  async updateProject(
    userId: number,
    id: number,
    updateProjectDto: UpdateProjectDto,
  ) {
    await this.findProjectById(userId, id);

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  async deleteProject(userId: number, id: number) {
    await this.findProjectById(userId, id);

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: `Project with ID ${id} successfully deleted` };
  }
}
