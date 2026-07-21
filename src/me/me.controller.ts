import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Request,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MeService } from './me.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetLeavesDto } from './dto/get-leaves.dto';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { GetAttendanceDto } from './dto/get-attendance.dto';
import { FieldPresenceDto } from './dto/field-presence.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthRequest } from '../common/types/auth-request.interface';

@ApiTags('Me - Employee Self-Service')
@ApiBearerAuth()
@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get employee dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboard(@Request() req: AuthRequest) {
    return this.meService.getDashboard(req.user.employeeId as string);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get employee profile information' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Request() req: AuthRequest) {
    return this.meService.getProfile(req.user.employeeId as string);
  }

  @Patch('password')
  @ApiOperation({ summary: 'Change employee password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid current password or passwords do not match',
  })
  async changePassword(
    @Request() req: AuthRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.meService.changePassword(req.user.uuid, dto);
  }

  @Get('attendance')
  @ApiOperation({
    summary: 'Get employee attendance records with filters and pagination',
  })
  @ApiQuery({
    name: 'statuses',
    required: false,
    description: 'Comma-separated statuses (PRESENT,LATE,FIELD)',
    example: 'PRESENT,LATE',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date filter',
    example: '2025-11-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date filter',
    example: '2025-11-30',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance records retrieved successfully',
  })
  async getAttendance(
    @Request() req: AuthRequest,
    @Query() query: GetAttendanceDto,
  ) {
    return this.meService.getAttendance(req.user.employeeId as string, query);
  }

  @Post('attendance/field-presence')
  @ApiOperation({ summary: 'Mark field presence with GPS coordinates' })
  @ApiResponse({
    status: 201,
    description: 'Field presence marked successfully',
  })
  @ApiResponse({
    status: 422,
    description: 'Validation error - missing required fields',
  })
  async fieldPresence(
    @Request() req: AuthRequest,
    @Body() dto: FieldPresenceDto,
  ) {
    return this.meService.fieldPresence(req.user.employeeId as string, dto);
  }

  @Get('leaves/recent')
  @ApiOperation({ summary: 'Get recent leave requests' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Recent leaves retrieved successfully',
  })
  async getRecentLeaves(
    @Request() req: AuthRequest,
    @Query('limit') limit?: string,
  ) {
    return this.meService.getRecentLeaves(
      req.user.employeeId as string,
      limit ? parseInt(limit) : 5,
    );
  }

  @Get('leaves')
  @ApiOperation({
    summary: 'Get employee leave requests with filters and pagination',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Leave status filter',
    example: 'APPROVED',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date filter',
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date filter',
    example: '2026-12-31',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Leave requests retrieved successfully',
  })
  async getLeaves(@Request() req: AuthRequest, @Query() query: GetLeavesDto) {
    return this.meService.getLeaves(req.user.employeeId as string, query);
  }

  @Post('leaves')
  @ApiOperation({
    summary: 'Submit a new leave request with optional justification file',
  })
  @ApiOperation({
    summary: 'Submit a new leave request with optional justification file',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['type', 'startDate', 'endDate', 'deductFromAnnualBalance'],
      properties: {
        type: {
          type: 'string',
          enum: ['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER'],
          example: 'ANNUAL',
        },
        startDate: { type: 'string', format: 'date', example: '2026-07-01' },
        endDate: { type: 'string', format: 'date', example: '2026-07-15' },
        observation: { type: 'string', example: 'Voyage familial' },
        deductFromAnnualBalance: { type: 'boolean', example: true },
        justificatif: {
          type: 'string',
          format: 'binary',
          description: 'Optional justification file',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Leave request created successfully',
  })
  @ApiResponse({
    status: 201,
    description: 'Leave request created successfully',
  })
  @ApiResponse({ status: 422, description: 'Validation error' })
  @UseInterceptors(FileInterceptor('justificatif'))
  async createLeave(
    @Request() req: AuthRequest,
    @Body() dto: CreateLeaveDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.meService.createLeave(req.user.employeeId as string, dto, file);
  }
}
