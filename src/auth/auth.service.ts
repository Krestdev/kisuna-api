import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly databaseService: DatabaseService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.databaseService.user.findFirst({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.passwordHash, 10);
    const user = await this.databaseService.user.create({
      data: {
        email: registerDto.email,
        passwordHash: hashedPassword,
      },
    });

    // const { passwordHash: _pw, ...result } = user;
    const { ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.databaseService.user.findFirst({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.passwordHash,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.uuid,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        uuid: user.uuid,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
    };
  }
}
