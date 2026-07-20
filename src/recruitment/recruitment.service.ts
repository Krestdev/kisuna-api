import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateRecruitmentDto } from './dto/create-recruitment.dto';
import { UpdateRecruitmentDto } from './dto/update-recruitment.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RecruitmentStatus } from '@prisma/client';

@Injectable()
export class RecruitmentService {
  constructor(private readonly db: DatabaseService) { }

  async create(dto: CreateRecruitmentDto) {
    try {
      return await this.db.recruitment.create({
        data: {
          title: dto.title,
          description: dto.description,
          status: dto.status,
          tags: dto.tags,
          criteria: dto.criteria,
          companyId: dto.companyId,
          place: dto.place,
          deadline: new Date(dto.deadline),
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2003')
        throw new BadRequestException('Company not found');
      throw e;
    }
  }

  findAll(companyId?: string) {
    return this.db.recruitment.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(uuid: string) {
    const record = await this.db.recruitment.findUnique({ where: { uuid } });
    if (!record) throw new NotFoundException('Recruitment not found');
    return record;
  }

  async update(uuid: string, dto: UpdateRecruitmentDto) {
    await this.findOne(uuid);
    return this.db.recruitment.update({
      where: { uuid },
      data: { ...dto, deadline: dto.deadline ? new Date(dto.deadline) : undefined },
    });
  }

  async remove(uuid: string) {
    await this.findOne(uuid);
    return this.db.recruitment.delete({ where: { uuid } });
  }

  async updateStatus(uuid: string, dto: { status: RecruitmentStatus }) {
    await this.findOne(uuid);
    return this.db.recruitment.update({
      where: { uuid },
      data: { status: dto.status },
    });
  }

  async updateTags(uuid: string, dto: { tags: string[] }) {
    const rec = await this.findOne(uuid);
    if (!rec) throw new NotFoundException('Recruitment not found');
    return this.db.recruitment.update({
      where: { uuid },
      data: { tags: dto.tags as any },
    });
  }
}
