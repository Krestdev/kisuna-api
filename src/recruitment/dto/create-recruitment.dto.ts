import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString } from 'class-validator';
import { RecruitmentStatus } from '@prisma/client';

export class CreateRecruitmentDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsNotEmpty() status: RecruitmentStatus;
  @IsArray() @IsString({ each: true }) @IsOptional() tags?: string[];
  @IsArray() @IsString({ each: true }) criteria: string[];
  @IsString() @IsNotEmpty() companyId: string;
  @IsString() @IsNotEmpty() place: string;
  @IsDateString() deadline: string;
}
