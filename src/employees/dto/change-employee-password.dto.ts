import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class changeEmployeePassword {
  @ApiProperty({ description: 'New password', example: '********' })
  @IsString()
  @IsNotEmpty({ message: 'Nouveau mot de passe requis' })
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères',
  })
  newPassword: string;
}
