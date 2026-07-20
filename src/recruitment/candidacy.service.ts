import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RustfsService } from '../rustfs/rustfs.service';
import { CreateCandidacyDto } from './dto/create-candidacy.dto';
import { UpdateCandidacyStatusDto } from './dto/update-candidacy-status.dto';

@Injectable()
export class CandidacyService {
  constructor(
    private readonly db: DatabaseService,
    private readonly rustfs: RustfsService,
  ) {}

  async create(
    dto: CreateCandidacyDto,
    files: {
      identityCard: Express.Multer.File;
      cv: Express.Multer.File;
      degree?: Express.Multer.File;
      coverLetter?: Express.Multer.File;
    },
  ) {
    const folder = `candidacies/${dto.recruitmentUuid}`;

    const [identityCard, cv] = await Promise.all([
      this.rustfs.uploadFile(files.identityCard, folder),
      this.rustfs.uploadFile(files.cv, folder),
    ]);

    const degree = files.degree ? await this.rustfs.uploadFile(files.degree, folder) : undefined;
    const coverLetter = files.coverLetter ? await this.rustfs.uploadFile(files.coverLetter, folder) : undefined;

    return this.db.candidacy.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        recruitmentUuid: dto.recruitmentUuid,
        identityCard,
        cv,
        degree,
        coverLetter,
      },
    });
  }

  findByRecruitment(recruitmentUuid: string) {
    return this.db.candidacy.findMany({
      where: { recruitmentUuid },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(uuid: string) {
    const record = await this.db.candidacy.findUnique({ where: { uuid } });
    if (!record) throw new NotFoundException('Candidacy not found');
    return record;
  }

  async updateStatus(uuid: string, dto: UpdateCandidacyStatusDto) {
    await this.findOne(uuid);
    return this.db.candidacy.update({ where: { uuid }, data: { status: dto.status } });
  }

  async remove(uuid: string) {
    await this.findOne(uuid);
    return this.db.candidacy.delete({ where: { uuid } });
  }
}
