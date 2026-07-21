import { IsOptional, IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllAttendanceDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 20;
  @IsOptional() @IsString() employeeId?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @Type(() => Number) @IsInt() month?: number;
  @IsOptional() @Type(() => Number) @IsInt() year?: number;
}
