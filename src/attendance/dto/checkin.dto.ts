import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({
    description: 'Employee UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({
    description: 'GPS Latitude coordinate',
    example: 3.848,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    description: 'GPS Longitude coordinate',
    example: 11.5021,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
