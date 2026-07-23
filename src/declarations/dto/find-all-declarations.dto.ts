import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { DeclarationStatus, DeclarationType } from 'generated/prisma/client';

export class FindAllDeclarationsDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  type?: DeclarationType;

  @IsOptional()
  @IsString()
  status?: DeclarationStatus;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsDate()
  periodStart?: Date;

  @IsOptional()
  @IsDate()
  periodEnd?: Date;

  @IsOptional()
  @IsString()
  submittedBy?: string;
}
