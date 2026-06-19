import { IsEnum } from 'class-validator';
import { SystemRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SetRoleDto {
  @ApiProperty({ 
    description: 'Role to assign to the employee',
    enum: SystemRole,
    example: 'COMPANY_ADMIN'
  })
  @IsEnum(SystemRole)
  role: SystemRole;
}
