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
import {
  CreateDeclarationLineDto,
  BulkCreateDeclarationLinesDto,
} from './dto/declaration-line.dto';
import {
  CreateDeclarationEarningDto,
  UpdateDeclarationEarningDto,
} from './dto/declaration-earning.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EarningCategory, DeclarationStatus } from '@prisma/client';

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
  @ApiResponse({ status: 400, description: 'Bad request' })
  createEarningItem(@Body() dto: CreateEarningItemDto) {
    return this.service.createEarningItem(dto);
  }

  @Get('earning-items')
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
  @ApiResponse({ status: 200, description: 'List of earning items' })
  findAllEarningItems(
    @Query('companyId') companyId: string,
    @Query('category') category?: EarningCategory,
    @Query('isActive') isActive?: string,
  ) {
    return this.service.findAllEarningItems(
      companyId,
      category,
      isActive ? isActive === 'true' : undefined,
    );
  }

  @Get('earning-items/:uuid')
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
  @ApiParam({ name: 'uuid', description: 'Earning item UUID' })
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
  @ApiParam({ name: 'uuid', description: 'Earning item UUID' })
  @ApiResponse({
    status: 200,
    description: 'Earning item deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Earning item not found' })
  deleteEarningItem(@Param('uuid') uuid: string) {
    return this.service.deleteEarningItem(uuid);
  }

  // Declaration routes
  @Post('declarations')
  @ApiOperation({
    summary: 'Create declaration',
    description: 'Create a new payroll declaration for a period',
  })
  @ApiResponse({ status: 201, description: 'Declaration created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createDeclaration(@Body() dto: CreateDeclarationDto) {
    return this.service.createDeclaration(dto);
  }

  @Get('declarations')
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
  @ApiResponse({ status: 200, description: 'List of declarations' })
  findAllDeclarations(
    @Query('companyId') companyId?: string,
    @Query('type') type?: string,
    @Query('status') status?: DeclarationStatus,
  ) {
    return this.service.findAllDeclarations(companyId, type, status);
  }

  @Get('declarations/:uuid')
  @ApiOperation({
    summary: 'Get declaration by ID',
    description: 'Retrieve a specific declaration with all lines and earnings',
  })
  @ApiParam({ name: 'uuid', description: 'Declaration UUID' })
  @ApiResponse({ status: 200, description: 'Declaration details' })
  @ApiResponse({ status: 404, description: 'Declaration not found' })
  findOneDeclaration(@Param('uuid') uuid: string) {
    return this.service.findOneDeclaration(uuid);
  }

  @Patch('declarations/:uuid')
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
  @ApiParam({ name: 'declarationId', description: 'Declaration UUID' })
  @ApiResponse({
    status: 201,
    description: 'Declaration lines created successfully',
  })
  @ApiResponse({ status: 404, description: 'Declaration not found' })
  createDeclarationLines(
    @Param('declarationId') declarationId: string,
    @Body() dto: BulkCreateDeclarationLinesDto,
  ) {
    return this.service.createDeclarationLines(declarationId, dto);
  }

  @Get('declarations/:declarationId/lines')
  @ApiOperation({
    summary: 'Get declaration lines',
    description: 'Retrieve all lines for a declaration',
  })
  @ApiParam({ name: 'declarationId', description: 'Declaration UUID' })
  @ApiResponse({ status: 200, description: 'List of declaration lines' })
  findDeclarationLines(@Param('declarationId') declarationId: string) {
    return this.service.findDeclarationLines(declarationId);
  }

  @Get('declarations/:declarationId/lines/:lineId')
  @ApiOperation({
    summary: 'Get declaration line by ID',
    description: 'Retrieve a specific declaration line with earnings',
  })
  @ApiParam({ name: 'declarationId', description: 'Declaration UUID' })
  @ApiParam({ name: 'lineId', description: 'Declaration line UUID' })
  @ApiResponse({ status: 200, description: 'Declaration line details' })
  @ApiResponse({ status: 404, description: 'Declaration line not found' })
  findOneDeclarationLine(@Param('lineId') lineId: string) {
    return this.service.findOneDeclarationLine(lineId);
  }

  @Patch('declarations/:declarationId/lines/:lineId')
  @ApiOperation({
    summary: 'Update declaration line',
    description: 'Update a declaration line',
  })
  @ApiParam({ name: 'declarationId', description: 'Declaration UUID' })
  @ApiParam({ name: 'lineId', description: 'Declaration line UUID' })
  @ApiResponse({
    status: 200,
    description: 'Declaration line updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Declaration line not found' })
  updateDeclarationLine(
    @Param('declarationId') declarationId: string,
    @Param('lineId') lineId: string,
    @Body() dto: CreateDeclarationLineDto,
  ) {
    return this.service.updateDeclarationLine(declarationId, lineId, dto);
  }

  @Delete('declarations/:declarationId/lines/:lineId')
  @ApiOperation({
    summary: 'Delete declaration line',
    description: 'Delete a declaration line and associated earnings',
  })
  @ApiParam({ name: 'declarationId', description: 'Declaration UUID' })
  @ApiParam({ name: 'lineId', description: 'Declaration line UUID' })
  @ApiResponse({
    status: 200,
    description: 'Declaration line deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Declaration line not found' })
  deleteDeclarationLine(@Param('lineId') lineId: string) {
    return this.service.deleteDeclarationLine(lineId);
  }

  // DeclarationEarning routes (granular edits)
  @Post('declaration-lines/:lineId/earnings')
  @ApiOperation({
    summary: 'Add earning to line',
    description: 'Add an earning entry to a declaration line',
  })
  @ApiParam({ name: 'lineId', description: 'Declaration line UUID' })
  @ApiResponse({ status: 201, description: 'Earning added successfully' })
  @ApiResponse({ status: 404, description: 'Declaration line not found' })
  createDeclarationEarning(
    @Param('lineId') lineId: string,
    @Body() dto: CreateDeclarationEarningDto,
  ) {
    return this.service.createDeclarationEarning(lineId, dto);
  }

  @Patch('declaration-lines/:lineId/earnings/:earningId')
  @ApiOperation({
    summary: 'Update earning',
    description: 'Update an earning entry amount',
  })
  @ApiParam({ name: 'lineId', description: 'Declaration line UUID' })
  @ApiParam({ name: 'earningId', description: 'Declaration earning UUID' })
  @ApiResponse({ status: 200, description: 'Earning updated successfully' })
  @ApiResponse({ status: 404, description: 'Earning not found' })
  updateDeclarationEarning(
    @Param('earningId') earningId: string,
    @Body() dto: UpdateDeclarationEarningDto,
  ) {
    return this.service.updateDeclarationEarning(earningId, dto);
  }

  @Delete('declaration-lines/:lineId/earnings/:earningId')
  @ApiOperation({
    summary: 'Delete earning',
    description: 'Remove an earning entry from a declaration line',
  })
  @ApiParam({ name: 'lineId', description: 'Declaration line UUID' })
  @ApiParam({ name: 'earningId', description: 'Declaration earning UUID' })
  @ApiResponse({ status: 200, description: 'Earning deleted successfully' })
  @ApiResponse({ status: 404, description: 'Earning not found' })
  deleteDeclarationEarning(@Param('earningId') earningId: string) {
    return this.service.deleteDeclarationEarning(earningId);
  }
}
