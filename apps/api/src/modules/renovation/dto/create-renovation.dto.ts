import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, MinLength, IsPositive } from 'class-validator';
import { ProjectType } from '../entities/renovation-project.entity';

export class CreateRenovationDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(20)
  description: string;

  @IsEnum(ProjectType)
  projectType: ProjectType;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsNumber()
  @IsPositive()
  budget: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class SubmitQuoteDto {
  @IsNumber()
  @IsPositive()
  quotedAmount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMilestoneDto {
  @IsString()
  milestoneId: string;

  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}
