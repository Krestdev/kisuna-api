import { Optional } from '@nestjs/common';
<<<<<<< HEAD
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
=======
import { DocumentType } from 'generated/prisma/client';

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
>>>>>>> 41fdb51806e04879018d5df3dc3a4b9ec48c865c
}
