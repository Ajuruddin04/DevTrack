import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ProjectStatus } from '../../generated/prisma/client';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @IsOptional()
  @IsUrl()
  repoUrl?: string;

  @IsOptional()
  @IsUrl()
  liveUrl?: string;
}
