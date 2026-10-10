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
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Job Applications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('job-applications')
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @ApiOperation({ summary: 'Create a job application record' })
  @ApiResponse({ status: 201, description: 'Job application created' })
  @Post()
  async createJobApplication(
    @GetUser('id') userId: number,
    @Body() createDto: CreateJobApplicationDto,
  ) {
    return this.jobApplicationsService.createJobApplication(userId, createDto);
  }

  @ApiOperation({ summary: 'Get all job applications for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of job applications' })
  @Get()
  async findAllUserJobApplications(@GetUser('id') userId: number) {
    return this.jobApplicationsService.findAllUserJobApplications(userId);
  }

  @ApiOperation({ summary: 'Get a job application by ID' })
  @ApiResponse({ status: 200, description: 'Job application details' })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  @Get(':id')
  async findJobApplicationById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.jobApplicationsService.findJobApplicationById(userId, id);
  }

  @ApiOperation({ summary: 'Update a job application status/details' })
  @ApiResponse({ status: 200, description: 'Job application updated' })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  @Patch(':id')
  async updateJobApplication(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateJobApplicationDto,
  ) {
    return this.jobApplicationsService.updateJobApplication(
      userId,
      id,
      updateDto,
    );
  }

  @ApiOperation({ summary: 'Delete a job application' })
  @ApiResponse({ status: 200, description: 'Job application deleted' })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  @Delete(':id')
  async deleteJobApplication(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.jobApplicationsService.deleteJobApplication(userId, id);
  }
}
