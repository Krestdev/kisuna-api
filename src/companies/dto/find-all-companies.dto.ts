import { IsOptional, IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Company } from 'generated/prisma/client';

export class FindAllCompaniesDto implements Partial<
  Omit<Company, 'uuid' | 'isActive' | 'updatedAt' | 'createdAt'>
> {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 20;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string | null;
}
