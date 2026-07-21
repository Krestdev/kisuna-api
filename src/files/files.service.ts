import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RustfsService } from '../rustfs/rustfs.service';
import { CreateFileDto } from './dto/create-file.dto';
import { FindAllFileDto } from './dto/find-all-file.dto';

@Injectable()
export class FilesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly rustfs: RustfsService,
  ) {}

  async uploadFile(
    employeeId: string,
    file: Express.Multer.File,
    dto: CreateFileDto,
  ) {
    // 1. Upload to RustFS
    const path = await this.rustfs.uploadFile(file, `employees/${employeeId}`);

    // 2. Save metadata to DB
    return this.databaseService.file.create({
      data: {
        file_name: file.originalname,
        document_type: dto.document_type,
        path,
        expired_date: dto.expired_date ? new Date(dto.expired_date) : null,
        employeeId,
      },
    });
  }

  async findAll(query: FindAllFileDto) {
    const {
      employeeId,
      document_type,
      file_name,
      expired_date,
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;
    const data = await this.databaseService.file.findMany({
      where: {
        // AND:[{
        employeeId,
        document_type,
        file_name,
        expired_date: expired_date ? new Date(expired_date) : null,
        // }]
      },
      skip,
      take: limit,
      include: {
        employee: {
          select: { uuid: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createAt: 'desc' },
    });

    const totalPages = Math.ceil(data.length / limit);
    return { data, meta: { page, limit, total: data.length, totalPages } };
  }

  async getPresignedUrl(fileId: string) {
    const file = await this.databaseService.file.findUnique({
      where: { uuid: fileId },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    if (!file.path) {
      throw new NotFoundException('File path not found in database');
    }
    const url = await this.rustfs.getFileUrl(file.path);
    return { url };
  }

  async deleteFile(fileId: string) {
    const file = await this.databaseService.file.findUnique({
      where: { uuid: fileId },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    if (!file.path) {
      throw new NotFoundException('File path not found in database');
    }

    // Delete from RustFS
    await this.rustfs.deleteFile(file.path);

    // Delete from DB
    await this.databaseService.file.delete({ where: { uuid: fileId } });
  }
}
