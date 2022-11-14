import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      userAcess: 'govId',
      password: 'password',
    });
  }

  async validate(userAcess: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(userAcess, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}