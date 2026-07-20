import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { COMPANY_SCOPE_KEY } from '../decorators/company-scope.decorator';
import { DatabaseService } from '../../database/database.service';

interface AuthenticatedRequest {
  user?: { role: string; employeeId?: string };
  userCompanyId?: string;
}

@Injectable()
export class CompanyScopeGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiresCompanyScope = this.reflector.getAllAndOverride<boolean>(
      COMPANY_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresCompanyScope) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role === 'SUPER_ADMIN') return true;
    if (user.role === 'ADMIN') return true;

    if (user.role === 'COMPANY_ADMIN') {
      if (!user.employeeId) {
        throw new ForbiddenException(
          'Employee ID missing from token. Please log in again.',
        );
      }

      const employee = await this.prisma.employee.findUnique({
        where: { uuid: user.employeeId },
        select: { companyId: true },
      });

      if (!employee?.companyId) {
        throw new ForbiddenException('Employee not assigned to any company');
      }

      request.userCompanyId = employee.companyId;
      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
