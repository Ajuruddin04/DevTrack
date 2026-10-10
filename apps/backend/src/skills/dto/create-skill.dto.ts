import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { SkillProficiency } from '../../generated/prisma/client';

export class CreateSkillDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(SkillProficiency)
  proficiency?: SkillProficiency;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercentage?: number;
}
