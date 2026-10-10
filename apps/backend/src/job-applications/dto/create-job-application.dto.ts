import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { JobApplicationStatus } from '../../generated/prisma/client';

export class CreateJobApplicationDto {
  @IsNotEmpty()
  @IsString()
  company: string;

  @IsNotEmpty()
  @IsString()
  role: string;

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
