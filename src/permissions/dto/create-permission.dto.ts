import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'manage_users', description: 'Permission identifier name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Can create, update, and delete users', description: 'Detailed description of the permission', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  description?: string;
}
