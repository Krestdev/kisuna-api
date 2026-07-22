import { Optional } from '@nestjs/common';
import { File, Employee, DocumentType } from 'generated/prisma/client';

export class FindAllFileDto {
  @Optional()
  file_name?: string;
  @Optional()
  document_type?: DocumentType | null;
  @Optional()
  path?: string | null;
  @Optional()
  expired_date?: Date | null;
  @Optional()
  employeeId?: string;

  @Optional()
  page?: number;
  @Optional()
  limit?: number;
}
