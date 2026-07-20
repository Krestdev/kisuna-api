import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard canActivate called');
    const request = context.switchToHttp().getRequest();
    console.log('Authorization header:', request.headers.authorization);
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
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
