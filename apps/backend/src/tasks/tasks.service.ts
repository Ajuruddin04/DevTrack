import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(userId: number, createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status,
        priority: createTaskDto.priority,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
        category: createTaskDto.category,
        isDaily: createTaskDto.isDaily ?? false,
        projectId: createTaskDto.projectId,
        userId,
      },
    });
  }

  async findAllUserTasks(userId: number, queryDto?: QueryTaskDto) {
    const where: any = { userId };

    if (queryDto?.status) {
      where.status = queryDto.status;
    }
    if (queryDto?.priority) {
      where.priority = queryDto.priority;
    }
    if (queryDto?.category) {
      where.category = queryDto.category;
    }
    if (queryDto?.isDaily !== undefined) {
      where.isDaily = queryDto.isDaily === 'true';
    }

    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTaskById(userId: number, id: number) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async updateTask(userId: number, id: number, updateTaskDto: UpdateTaskDto) {
    await this.findTaskById(userId, id);

    const data: any = Object.assign({}, updateTaskDto);
    if (updateTaskDto.dueDate) {
      data.dueDate = new Date(updateTaskDto.dueDate);
    }

    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async deleteTask(userId: number, id: number) {
    await this.findTaskById(userId, id);

    await this.prisma.task.delete({
      where: { id },
    });

    return { message: `Task with ID ${id} successfully deleted` };
  }
}
