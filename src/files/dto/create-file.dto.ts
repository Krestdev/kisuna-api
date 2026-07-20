import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { DocumentType } from '@prisma/client';
export class CreateFileDto {
  @ApiProperty({ enum: DocumentType, description: 'Type of the document' })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  document_type: DocumentType;

  @ApiPropertyOptional({
    description:
      'Expiration date of the document (optional, e.g., for ID cards)',
  })
  @ValidateIf(
    (o: { expired_date?: unknown }) =>
      o.expired_date !== '' &&
      o.expired_date !== null &&
      o.expired_date !== undefined,
  )
  @IsDateString()
  expired_date?: string;
}
