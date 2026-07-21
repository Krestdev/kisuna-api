import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserCreateInput } from 'generated/prisma/models';

export class LoginDto implements Omit<
  UserCreateInput,
  'id' | 'role' | 'status' | 'createdAt' | 'updatedAt'
> {
  @ApiProperty({
    example: 'admin@krest.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'admin123',
    description: 'User password',
    minLength: 6,
  })
  @ApiProperty({
    example: 'admin123',
    description: 'User password',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  passwordHash!: string;
}
