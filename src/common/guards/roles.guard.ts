import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { SystemRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  employeeId?: string;
}

interface AuthenticatedRequest {
  headers: { authorization?: string };
  user?: { uuid: string; email: string; role: SystemRole; employeeId?: string };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'super-secret-key-for-dev',
      });
      request.user = {
        uuid: payload.sub,
        email: payload.email,
        role: payload.role as SystemRole,
        employeeId: payload.employeeId,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    if (!request.user?.role) {
      return false;
    }

    return requiredRoles.includes(request.user.role);
  }

  private extractTokenFromHeader(
    request: AuthenticatedRequest,
  ): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
