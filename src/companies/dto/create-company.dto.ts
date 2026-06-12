import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Krest Holding', description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Leading technology and innovation company', description: 'Company description', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  description?: string;
}
