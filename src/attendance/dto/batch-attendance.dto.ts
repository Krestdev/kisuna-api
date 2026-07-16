import { IsString, IsNotEmpty, IsArray, IsOptional, IsDateString } from 'class-validator';

export class BatchAttendanceItemDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsDateString()
  date: string;

  @IsArray()
  @IsOptional()
  statut?: string[];

  @IsString()
  @IsOptional()
  checkIn?: string; // "HH:mm:ss"

  @IsString()
  @IsOptional()
  checkOut?: string; // "HH:mm:ss"
}
