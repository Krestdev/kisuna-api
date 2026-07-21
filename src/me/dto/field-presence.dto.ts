import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceCreateInput } from 'generated/prisma/models';

export class FieldPresenceDto implements Pick<
  AttendanceCreateInput,
  'location' | 'mission' | 'observations' | 'latitude' | 'longitude'
> {
  @ApiProperty({
    description: 'Location/place of field presence',
    example: 'Bastos, Yaoundé',
  })
  @IsString()
  @IsNotEmpty({ message: 'Lieu requis' })
  location: string;

  @ApiProperty({
    description: 'Mission description',
    example: 'Installation serveur client',
  })
  @ApiProperty({
    description: 'Mission description',
    example: 'Installation serveur client',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mission requise' })
  mission: string;

  @ApiPropertyOptional({
    description: 'Additional observations',
    example: 'RAS',
  })
  @ApiPropertyOptional({
    description: 'Additional observations',
    example: 'RAS',
  })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiProperty({ description: 'GPS latitude coordinate', example: 3.848 })
  @ApiProperty({ description: 'GPS latitude coordinate', example: 3.848 })
  @IsNumber()
  @IsNotEmpty({ message: 'Coordonnées GPS requises' })
  latitude: number;

  @ApiProperty({ description: 'GPS longitude coordinate', example: 11.5021 })
  @IsNumber()
  @IsNotEmpty({ message: 'Coordonnées GPS requises' })
  longitude: number;
}
