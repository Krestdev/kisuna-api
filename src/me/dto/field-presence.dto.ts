import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FieldPresenceDto {
  @ApiProperty({ description: 'Location/place of field presence', example: 'Bastos, Yaoundé' })
  @IsString()
  @IsNotEmpty({ message: 'Lieu requis' })
  location: string;

  @ApiProperty({ description: 'Mission description', example: 'Installation serveur client' })
  @IsString()
  @IsNotEmpty({ message: 'Mission requise' })
  mission: string;

  @ApiPropertyOptional({ description: 'Additional observations', example: 'RAS' })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiProperty({ description: 'GPS latitude coordinate', example: 3.8480 })
  @IsNumber()
  @IsNotEmpty({ message: 'Coordonnées GPS requises' })
  latitude: number;

  @ApiProperty({ description: 'GPS longitude coordinate', example: 11.5021 })
  @IsNumber()
  @IsNotEmpty({ message: 'Coordonnées GPS requises' })
  longitude: number;
}
