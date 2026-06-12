import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  phoneNumber?: number;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  matrimonial_status?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  number_of_children?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  CNPSNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactName?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  EmergencyContactPhone?: number;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  status?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  companyId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  positionUuid?: number;
}
