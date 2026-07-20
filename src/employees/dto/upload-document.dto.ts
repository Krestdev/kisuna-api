import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Name of the file' })
  @IsString()
  @IsNotEmpty()
  file_name: string;

  @ApiProperty({ enum: DocumentType, description: 'Type of the document' })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  document_type: DocumentType;

  @ApiPropertyOptional({
    description: 'Path or URL to the stored file (e.g., S3 URL)',
  })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({
    description: 'Expiration date of the document (e.g., ID cards)',
  })
  @IsOptional()
  @IsDateString()
  expired_date?: string;
}
