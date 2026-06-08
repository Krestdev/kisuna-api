import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePositionDto {
  @ApiProperty({ description: 'The name of the position' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'The description of the position', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
