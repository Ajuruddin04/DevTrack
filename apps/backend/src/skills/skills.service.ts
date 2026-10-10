import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSkill(userId: number, createDto: CreateSkillDto) {
    const existingSkill = await this.prisma.skill.findUnique({
      where: {
        userId_name: {
          userId,
          name: createDto.name,
        },
      },
    });

    if (existingSkill) {
      throw new ConflictException(
        `Skill '${createDto.name}' already exists in your skill list`,
      );
    }

    return this.prisma.skill.create({
      data: {
        name: createDto.name,
        category: createDto.category,
        proficiency: createDto.proficiency,
        progressPercentage: createDto.progressPercentage ?? 0,
        userId,
      },
    });
  }

  async findAllUserSkills(userId: number) {
    return this.prisma.skill.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSkillById(userId: number, id: number) {
    const skill = await this.prisma.skill.findFirst({
      where: { id, userId },
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }

    return skill;
  }

  async updateSkill(userId: number, id: number, updateDto: UpdateSkillDto) {
    await this.findSkillById(userId, id);

    if (updateDto.name) {
      const existingSkill = await this.prisma.skill.findUnique({
        where: {
          userId_name: {
            userId,
            name: updateDto.name,
          },
        },
      });

      if (existingSkill && existingSkill.id !== id) {
        throw new ConflictException(
          `Skill '${updateDto.name}' already exists in your skill list`,
        );
      }
    }

    return this.prisma.skill.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteSkill(userId: number, id: number) {
    await this.findSkillById(userId, id);

    await this.prisma.skill.delete({
      where: { id },
    });

    return { message: `Skill with ID ${id} successfully deleted` };
  }
}
