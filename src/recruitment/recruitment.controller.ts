import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service';
import { CreateRecruitmentDto } from './dto/create-recruitment.dto';
import { UpdateRecruitmentDto } from './dto/update-recruitment.dto';
import { RecruitmentStatus } from '@prisma/client';

@ApiTags('Recruitment')
@ApiBearerAuth('JWT-auth')
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) { }

  @Post()
  @ApiOperation({ summary: 'Create a recruitment post' })
  create(@Body() dto: CreateRecruitmentDto) {
    return this.recruitmentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all recruitment posts' })
  @ApiQuery({ name: 'companyId', required: false })
  findAll(@Query('companyId') companyId?: string) {
    return this.recruitmentService.findAll(companyId);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get a recruitment post' })
  findOne(@Param('uuid') uuid: string) {
    return this.recruitmentService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update a recruitment post' })
  update(@Param('uuid') uuid: string, @Body() dto: UpdateRecruitmentDto) {
    return this.recruitmentService.update(uuid, dto);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete a recruitment post' })
  remove(@Param('uuid') uuid: string) {
    return this.recruitmentService.remove(uuid);
  }


  @Patch(':uuid/status')
  updateStatus(@Param('uuid') uuid: string, @Body() dto: { status: RecruitmentStatus }) {
    return this.recruitmentService.updateStatus(uuid, dto);
  }


  @Patch(':uuid/tag')
  @ApiOperation({ summary: 'Update a recruitment post tags' })
  updateTags(@Param('uuid') uuid: string, @Body() dto: { tags: string[] }) {
    return this.recruitmentService.updateTags(uuid, dto);
  }
}
