import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password', example: '********' })
  @IsString()
  @IsNotEmpty({ message: 'Mot de passe actuel requis' })
  currentPassword: string;

  @ApiProperty({ description: 'New password', example: '********' })
  @IsString()
  @IsNotEmpty({ message: 'Nouveau mot de passe requis' })
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères',
  })
  newPassword: string;

  @ApiProperty({ description: 'Confirm new password', example: '********' })
  @IsString()
  @IsNotEmpty({ message: 'Confirmation du mot de passe requise' })
  confirmPassword: string;
}
