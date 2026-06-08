import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createPositionDto: CreatePositionDto) {
    return this.databaseService.position.create({
      data: createPositionDto,
    });
  }

  findAll() {
    return this.databaseService.position.findMany();
  }

  findOne(uuid: string) {
    return this.databaseService.position.findUnique({
      where: { uuid },
    });
  }

  update(uuid: string, updatePositionDto: UpdatePositionDto) {
    return this.databaseService.position.update({
      where: { uuid },
      data: updatePositionDto,
    });
  }

  remove(uuid: string) {
    return this.databaseService.position.delete({
      where: { uuid },
    });
  }
}
