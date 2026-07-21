import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  Declaration,
  DeclarationStatus,
  DeclarationType,
} from 'generated/prisma/client';

export class FindAllDeclarationsDto implements Omit<
  Declaration,
  'uuid' | 'createdAt' | 'updatedAt' | 'notes' | 'submittedAt'
> {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  type: DeclarationType;

  @IsOptional()
  @IsString()
  status: DeclarationStatus;

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
  periodStart: Date;

  @IsOptional()
  @IsDate()
  periodEnd: Date;

  @IsOptional()
  @IsString()
  submittedBy: string;
}
