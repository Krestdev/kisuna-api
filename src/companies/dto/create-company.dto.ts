import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { CompanyCreateInput } from 'generated/prisma/models';

export class CreateCompanyDto implements Omit<
  CompanyCreateInput,
  'id' | 'createdAt' | 'updatedAt'
> {
  @ApiProperty({ example: 'Acme Corp', description: 'The name of the company' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'A leading technology company',
    description: 'Company description',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  description?: string;
}
