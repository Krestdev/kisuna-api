import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { AttendanceCreateInput } from 'generated/prisma/models';

export class BatchAttendanceItemDto implements Omit<
  AttendanceCreateInput,
  'id' | 'status' | 'employee' | 'createdAt' | 'updatedAt'
> {
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
  checkIn!: string; // "HH:mm:ss"

  @IsString()
  @IsOptional()
  checkOut?: string; // "HH:mm:ss"

  @IsNumber()
  @IsOptional()
  latitude: number;

  @IsNumber()
  @IsOptional()
  longitude: number;
}
