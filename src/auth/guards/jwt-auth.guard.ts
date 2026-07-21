import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

interface JwtRequest {
  headers: { authorization?: string };
  user?: { uuid: string; email: string; role: string; employeeId?: string };
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<JwtRequest>();
    console.log('Authorization header:', request.headers.authorization);
    return super.canActivate(context);
  }

  handleRequest<T>(err: Error | null, user: T, info: unknown): T {
    console.log(
      'JwtAuthGuard handleRequest - err:',
      err,
      'user:',
      user,
      'info:',
      info,
    );
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException('Invalid token or authentication failed')
      );
    }
    return user;
  }
}
