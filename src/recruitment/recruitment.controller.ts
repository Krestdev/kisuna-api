import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

import { RecruitmentService } from './recruitment.service';
import { CreateRecruitmentDto } from './dto/create-recruitment.dto';
import { UpdateRecruitmentDto } from './dto/update-recruitment.dto';
import { RecruitmentStatus, SystemRole } from '../../generated/prisma/client';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Recruitment')
@ApiBearerAuth('JWT-auth')
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a recruitment post' })
  @ApiResponse({ status: 201, description: 'recruitment created' })
  create(@Body() dto: CreateRecruitmentDto) {
    return this.recruitmentService.create(dto);
  }

  @Get()
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiOperation({ summary: 'List all recruitment posts' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiResponse({ status: 200, description: 'recruitments found' })
  findAll(@Query('companyId') companyId?: string) {
    return this.recruitmentService.findAll(companyId);
  }
  @Get(':uuid')
  @Roles(SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiOperation({ summary: 'Get a recruitment post' })
  @ApiResponse({ status: 200, description: 'recruitment found' })
  findOne(@Param('uuid') uuid: string) {
    return this.recruitmentService.findOne(uuid);
  }

  @Patch(':uuid')
  @Roles(SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiOperation({ summary: 'Update a recruitment post' })
  @ApiResponse({ status: 201, description: 'recruitment updated' })
  update(@Param('uuid') uuid: string, @Body() dto: UpdateRecruitmentDto) {
    return this.recruitmentService.update(uuid, dto);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete a recruitment post' })
  @Roles(SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiResponse({ status: 200, description: 'recruitment removed successfully' })
  remove(@Param('uuid') uuid: string) {
    return this.recruitmentService.remove(uuid);
  }

  @Patch(':uuid/status')
  @Roles(SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiResponse({ status: 201, description: 'recruitment status updated' })
  updateStatus(
    @Param('uuid') uuid: string,
    @Body() dto: { status: RecruitmentStatus },
  ) {
    return this.recruitmentService.updateStatus(uuid, dto);
  }

  @Patch(':uuid/tag')
  @ApiOperation({ summary: 'Update a recruitment post tags' })
  updateTags(@Param('uuid') uuid: string, @Body() dto: { tags: string[] }) {
    return this.recruitmentService.updateTags(uuid, dto);
  }
}
