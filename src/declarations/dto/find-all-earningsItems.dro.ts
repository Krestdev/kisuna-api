import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class findAllEarningItems {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
