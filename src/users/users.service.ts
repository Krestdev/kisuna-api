import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma, User } from '../../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.databaseService.user.create({
      data,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: { email },
    });
  }

  async findById(uuid: string): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: { uuid },
    });
  }
}
