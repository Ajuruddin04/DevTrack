import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { SkillProficiency } from '../../generated/prisma/client';

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  name?: string;

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
