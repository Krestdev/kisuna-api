import { Optional } from '@nestjs/common';
import { File, Employee, DocumentType } from 'generated/prisma/client';

export class FindAllFileDto implements File {
  @Optional()
  uuid: string;
  @Optional()
  file_name: string;
  @Optional()
  document_type: DocumentType | null;
  @Optional()
  path: string | null;
  @Optional()
  expired_date: Date | null;
  @Optional()
  createAt: Date;
  @Optional()
  updatedAt: Date;
  @Optional()
  employeeId: string;
  @Optional()
  employee: Employee;

  page: number;
  limit: number;
}
