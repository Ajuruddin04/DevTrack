import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { JobApplicationStatus } from '../../generated/prisma/client';

export class UpdateJobApplicationDto {
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsEnum(JobApplicationStatus)
  status?: JobApplicationStatus;

  @IsOptional()
  @IsISO8601()
  applicationDate?: string;

  @IsOptional()
  @IsISO8601()
  interviewDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUrl()
  jobUrl?: string;
}
