import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key-for-dev',
    });
    console.log(
      'JwtStrategy initialized with secret:',
      process.env.JWT_SECRET || 'super-secret-key-for-dev',
    );
  }

  async validate(payload: any) {
    console.log('JWT validate called with payload:', payload);
    const user = {
      uuid: payload.sub,
      email: payload.email,
      role: payload.role,
      employeeId: payload.employeeId,
    };
    console.log('Returning user:', user);
    return user;
  }
}
