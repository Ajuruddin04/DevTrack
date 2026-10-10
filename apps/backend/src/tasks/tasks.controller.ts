import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Create a task for the authenticated user' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @Post()
  async createTask(
    @GetUser('id') userId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(userId, createTaskDto);
  }

  @ApiOperation({ summary: 'Get all tasks for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user tasks' })
  @Get()
  async findAllUserTasks(
    @GetUser('id') userId: number,
    @Query() queryDto: QueryTaskDto,
  ) {
    return this.tasksService.findAllUserTasks(userId, queryDto);
  }

  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiResponse({ status: 200, description: 'Task details' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @Get(':id')
  async findTaskById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tasksService.findTaskById(userId, id);
  }

  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @Patch(':id')
  async updateTask(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(userId, id, updateTaskDto);
  }

  @ApiOperation({ summary: 'Delete a task by ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @Delete(':id')
  async deleteTask(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tasksService.deleteTask(userId, id);
  }
}
