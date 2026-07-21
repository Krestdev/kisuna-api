import { EarningItem, EarningCategory } from 'generated/prisma/client';
import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class findAllEarningItems implements Omit<
  EarningItem,
  'uuid' | 'createdAt' | 'updatedAt'
> {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  category: EarningCategory;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
