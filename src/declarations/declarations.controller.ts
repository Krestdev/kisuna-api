import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { DeclarationsService } from './declarations.service';

import {
  CreateEarningItemDto,
  UpdateEarningItemDto,
} from './dto/earning-item.dto';

import {
  CreateDeclarationDto,
  UpdateDeclarationDto,
} from './dto/declaration.dto';

import { BulkCreateDeclarationLinesDto } from './dto/declaration-line.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import {
  EarningCategory,
  DeclarationStatus,
} from '../../generated/prisma/client';

@ApiTags('Declarations')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard)
export class DeclarationsController {
  constructor(private readonly service: DeclarationsService) {}

  // EarningItem routes

  @Post('earning-items')
  @ApiOperation({
    summary: 'Create earning item',

    description: 'Create a new earning item (salary component) for a company',
  })
  @ApiResponse({
    status: 201,

    description: 'Earning item created successfully',
  })
  createEarningItem(@Body() dto: CreateEarningItemDto) {
    return this.service.createEarningItem(dto);
  }

  @Get('earning-items')
  @ApiOperation({
    summary: 'Get all earning items',

    description:
      'Retrieve earning items filtered by company, category, or active status',
  })
  @ApiOperation({
    summary: 'Get all earning items',

    description:
      'Retrieve earning items filtered by company, category, or active status',
  })
  @ApiQuery({ name: 'companyId', required: true, description: 'Company UUID' })
  @ApiQuery({
    name: 'category',

    required: false,

    enum: EarningCategory,

    description: 'Filter by earning category',
  })
  @ApiQuery({
    name: 'isActive',

    required: false,

    description: 'Filter by active status (true/false)',
  })
  @ApiQuery({
    name: 'category',

    required: false,

    enum: EarningCategory,
    description: 'Filter by earning category',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status (true/false)',
  })
  @ApiResponse({ status: 200, description: 'List of earning items' })
  findAllEarningItems(@Query() query: Record<string, unknown>) {
    return this.service.findAllEarningItems(query);
  }

  @Get('earning-items/:uuid')
  @ApiOperation({
    summary: 'Get earning item by ID',

    description: 'Retrieve a specific earning item',
  })
  @ApiOperation({
    summary: 'Get earning item by ID',

    description: 'Retrieve a specific earning item',
  })
  @ApiParam({ name: 'uuid', description: 'Earning item UUID' })
  @ApiResponse({ status: 200, description: 'Earning item details' })
  @ApiResponse({ status: 404, description: 'Earning item not found' })
  findOneEarningItem(@Param('uuid') uuid: string) {
    return this.service.findOneEarningItem(uuid);
  }

  @Patch('earning-items/:uuid')
  @ApiOperation({
    summary: 'Update earning item',

    description: 'Update an existing earning item',
  })
  @ApiOperation({
    summary: 'Update earning item',

    description: 'Update an existing earning item',
  })
  @ApiParam({ name: 'uuid', description: 'Earning item UUID' })
  @ApiResponse({
    status: 200,

    description: 'Earning item updated successfully',
  })
  @ApiResponse({
    status: 200,

    description: 'Earning item updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Earning item not found' })
  updateEarningItem(
    @Param('uuid') uuid: string,

    @Body() dto: UpdateEarningItemDto,
  ) {
    return this.service.updateEarningItem(uuid, dto);
  }

  @Delete('earning-items/:uuid')
  @ApiOperation({
    summary: 'Delete earning item',

    description: 'Delete an earning item',
  })
  @ApiOperation({
    summary: 'Delete earning item',

    description: 'Delete an earning item',
  })
  @ApiParam({ name: 'uuid', description: 'Earning item UUID' })
  @ApiResponse({
    status: 200,

    description: 'Earning item deleted successfully',
  })
  @ApiResponse({
    status: 200,

    description: 'Earning item deleted successfully',
  })
  deleteEarningItem(@Param('uuid') uuid: string) {
    return this.service.deleteEarningItem(uuid);
  }

  // Declaration routes

  @Post('declarations')
  @ApiOperation({
    summary: 'Create declaration',

    description: 'Create a new payroll declaration for a period',
  })
  @ApiOperation({
    summary: 'Create declaration',

    description: 'Create a new payroll declaration for a period',
  })
  @ApiResponse({ status: 201, description: 'Declaration created successfully' })
  createDeclaration(@Body() dto: CreateDeclarationDto) {
    return this.service.createDeclaration(dto);
  }

  @Get('declarations')
  @ApiOperation({
    summary: 'Get all declarations',

    description: 'Retrieve declarations filtered by company, type, or status',
  })
  @ApiOperation({
    summary: 'Get all declarations',

    description: 'Retrieve declarations filtered by company, type, or status',
  })
  @ApiQuery({ name: 'companyId', required: false, description: 'Company UUID' })
  @ApiQuery({ name: 'type', required: false, description: 'Declaration type' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: DeclarationStatus,
    description: 'Declaration status',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: DeclarationStatus,
    description: 'Declaration status',
  })
  @ApiResponse({ status: 200, description: 'List of declarations' })
  findAllDeclarations(@Query() query: Record<string, unknown>) {
    return this.service.findAllDeclarations(query);
  }

  @Get('declarations/:uuid')
  @ApiOperation({
    summary: 'Get declaration by ID',

    description: 'Retrieve a specific declaration with all lines and earnings',
  })
  @ApiOperation({
    summary: 'Get declaration by ID',

    description: 'Retrieve a specific declaration with all lines and earnings',
  })
  @ApiParam({ name: 'uuid', description: 'Declaration UUID' })
  @ApiResponse({ status: 200, description: 'Declaration details' })
  findOneDeclaration(@Param('uuid') uuid: string) {
    return this.service.findOneDeclaration(uuid);
  }

  @Patch('declarations/:uuid')
  @ApiOperation({
    summary: 'Update declaration',

    description: 'Update declaration details or status',
  })
  @ApiOperation({
    summary: 'Update declaration',

    description: 'Update declaration details or status',
  })
  @ApiParam({ name: 'uuid', description: 'Declaration UUID' })
  @ApiResponse({ status: 200, description: 'Declaration updated successfully' })
  @ApiResponse({ status: 404, description: 'Declaration not found' })
  updateDeclaration(
    @Param('uuid') uuid: string,

    @Body() dto: UpdateDeclarationDto,
  ) {
    return this.service.updateDeclaration(uuid, dto);
  }

  @Delete('declarations/:uuid')
  @ApiOperation({
    summary: 'Delete declaration',

    description: 'Delete a declaration and all associated lines',
  })
  @ApiOperation({
    summary: 'Delete declaration',

    description: 'Delete a declaration and all associated lines',
  })
  @ApiParam({ name: 'uuid', description: 'Declaration UUID' })
  @ApiResponse({ status: 200, description: 'Declaration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Declaration not found' })
  deleteDeclaration(@Param('uuid') uuid: string) {
    return this.service.deleteDeclaration(uuid);
  }

  // DeclarationLine routes (bulk/wizard)

  @Post('declarations/:declarationId/lines')
  @ApiOperation({
    summary: 'Create declaration lines',

    description: 'Bulk create declaration lines for employees',
  })
  @ApiOperation({
    summary: 'Create declaration lines',
    description: 'Bulk create declaration lines for employees',
  })
  @ApiParam({ name: 'declarationId', description: 'Declaration UUID' })
  @ApiResponse({
    status: 201,
    description: 'Declaration lines created successfully',
  })
  createDeclarationLines(
    @Param('declarationId') declarationId: string,
    @Body() dto: BulkCreateDeclarationLinesDto,
  ) {
    return this.service.createDeclarationLines(declarationId, dto);
  }
}
