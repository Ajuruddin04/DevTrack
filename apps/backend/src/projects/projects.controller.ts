import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Create a project for the authenticated user' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @Post()
  async createProject(
    @GetUser('id') userId: number,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectsService.createProject(userId, createProjectDto);
  }

  @ApiOperation({ summary: 'Get all projects for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user projects with progress calculation' })
  @Get()
  async findAllUserProjects(@GetUser('id') userId: number) {
    return this.projectsService.findAllUserProjects(userId);
  }

  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({ status: 200, description: 'Project details with linked tasks' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @Get(':id')
  async findProjectById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.findProjectById(userId, id);
  }

  @ApiOperation({ summary: 'Update a project by ID' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @Patch(':id')
  async updateProject(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(userId, id, updateProjectDto);
  }

  @ApiOperation({ summary: 'Delete a project by ID' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @Delete(':id')
  async deleteProject(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.deleteProject(userId, id);
  }
}
