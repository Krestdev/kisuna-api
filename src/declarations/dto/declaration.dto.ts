import { IsEnum, IsDateString, IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeclarationType, DeclarationStatus } from '@prisma/client';

export class CreateDeclarationDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Company UUID' })
  @IsUUID()
  companyId: string;

  @ApiProperty({ enum: DeclarationType, example: 'MONTHLY', required: false, description: 'Type of declaration' })
  @IsEnum(DeclarationType)
  @IsOptional()
  type?: DeclarationType;

  @ApiProperty({ example: '2026-06-01', description: 'Start date of declaration period' })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ example: '2026-06-30', description: 'End date of declaration period' })
  @IsDateString()
  periodEnd: string;
}

export class UpdateDeclarationDto {
  @ApiProperty({ enum: DeclarationStatus, example: 'SUBMITTED', required: false, description: 'Declaration status' })
  @IsEnum(DeclarationStatus)
  @IsOptional()
  status?: DeclarationStatus;

  @ApiProperty({ example: 'Approved with corrections', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  submittedBy?: string;
}
