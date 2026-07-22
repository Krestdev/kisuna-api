import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CandidacyService } from './candidacy.service';
import { CreateCandidacyDto } from '../dto/create-candidacy.dto';
import { UpdateCandidacyStatusDto } from '../dto/update-candidacy-status.dto';

@ApiTags('Candidacy')
@Controller('recruitment/candidacy')
export class CandidacyController {
  constructor(private readonly candidacyService: CandidacyService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a candidacy with file uploads' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'fullName',
        'phone',
        'email',
        'address',
        'recruitmentUuid',
        'identityCard',
        'cv',
      ],
      properties: {
        fullName: { type: 'string', example: 'John Doe' },
        phone: { type: 'string', example: '+237612345678' },
        email: { type: 'string', example: 'john.doe@email.com' },
        address: { type: 'string', example: 'Douala, Cameroun' },
        recruitmentUuid: { type: 'string', example: 'uuid-of-recruitment' },
        identityCard: { type: 'string', format: 'binary' },
        cv: { type: 'string', format: 'binary' },
        degree: { type: 'string', format: 'binary' },
        coverLetter: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'identityCard', maxCount: 1 },
      { name: 'cv', maxCount: 1 },
      { name: 'degree', maxCount: 1 },
      { name: 'coverLetter', maxCount: 1 },
    ]),
  )
  create(
    @Body() dto: CreateCandidacyDto,
    @UploadedFiles()
    files: {
      identityCard: Express.Multer.File[];
      cv: Express.Multer.File[];
      degree?: Express.Multer.File[];
      coverLetter?: Express.Multer.File[];
    },
  ) {
    return this.candidacyService.create(dto, {
      identityCard: files.identityCard[0],
      cv: files.cv[0],
      degree: files.degree?.[0],
      coverLetter: files.coverLetter?.[0],
    });
  }

  @Get('recruitment/:recruitmentUuid')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List candidacies for a recruitment post' })
  findByRecruitment(@Param('recruitmentUuid') recruitmentUuid: string) {
    return this.candidacyService.findByRecruitment(recruitmentUuid);
  }

  @Get(':uuid')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a candidacy' })
  findOne(@Param('uuid') uuid: string) {
    return this.candidacyService.findOne(uuid);
  }

  @Patch(':uuid/status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update candidacy status' })
  updateStatus(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateCandidacyStatusDto,
  ) {
    return this.candidacyService.updateStatus(uuid, dto);
  }

  @Delete(':uuid')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a candidacy' })
  remove(@Param('uuid') uuid: string) {
    return this.candidacyService.remove(uuid);
  }
}
