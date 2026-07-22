import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  Get,
  Body,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { FilesService } from './files.service';

import { CreateFileDto } from './dto/create-file.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { SystemRole } from '../../generated/prisma/client';

import { Roles } from '../common/decorators/roles.decorator';

import { RolesGuard } from '../common/guards/roles.guard';
import { FindAllFileDto } from './dto/find-all-file.dto';

@ApiTags('Files')
@Controller('employees/:employeeId/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload a file for an employee' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'employeeId', description: 'Employee UUID' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('employeeId') employeeId: string,

    @UploadedFile() file: Express.Multer.File,

    @Body() dto: CreateFileDto,
  ) {
    return this.filesService.uploadFile(employeeId, file, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all files metadata for an employee' })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: 'Employee UUID',
  })
  @ApiQuery({
    name: 'document_type',
    required: false,
    description: 'Document type',
  })
  @ApiQuery({ name: 'file_name', required: false, description: 'File name' })
  @ApiQuery({
    name: 'expired_date',
    required: false,
    description: 'Expired date',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit per page',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'List of files' })
  findAll(@Query() query: Record<string, unknown>) {
    return this.filesService.findAll(query);
  }

  @Get(':fileId/url')
  @ApiOperation({
    summary: 'Get a presigned URL to securely download/view the file',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee UUID' })
  @ApiParam({ name: 'fileId', description: 'File UUID' })
  @ApiResponse({ status: 200, description: 'Presigned URL' })
  getUrl(@Param('fileId') fileId: string) {
    return this.filesService.getPresignedUrl(fileId);
  }

  @Delete(':fileId')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'employeeId', description: 'Employee UUID' })
  @ApiParam({ name: 'fileId', description: 'File UUID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  deleteFile(@Param('fileId') fileId: string) {
    return this.filesService.deleteFile(fileId);
  }
}
