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
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Skills')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @ApiOperation({ summary: 'Create a technology / skill record' })
  @ApiResponse({ status: 201, description: 'Skill created successfully' })
  @ApiResponse({ status: 409, description: 'Skill already exists' })
  @Post()
  async createSkill(
    @GetUser('id') userId: number,
    @Body() createDto: CreateSkillDto,
  ) {
    return this.skillsService.createSkill(userId, createDto);
  }

  @ApiOperation({ summary: 'Get all skills for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user skills' })
  @Get()
  async findAllUserSkills(@GetUser('id') userId: number) {
    return this.skillsService.findAllUserSkills(userId);
  }

  @ApiOperation({ summary: 'Get a skill by ID' })
  @ApiResponse({ status: 200, description: 'Skill details' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  @Get(':id')
  async findSkillById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.skillsService.findSkillById(userId, id);
  }

  @ApiOperation({ summary: 'Update skill progress or details' })
  @ApiResponse({ status: 200, description: 'Skill updated successfully' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  @Patch(':id')
  async updateSkill(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSkillDto,
  ) {
    return this.skillsService.updateSkill(userId, id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a skill' })
  @ApiResponse({ status: 200, description: 'Skill deleted successfully' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  @Delete(':id')
  async deleteSkill(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.skillsService.deleteSkill(userId, id);
  }
}
