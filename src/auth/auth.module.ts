import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './shared/auth.service';
import { jwtConstants } from './shared/constants';
import { JwtStrategy } from './shared/jwt.strategy';
import { LocalStrategy } from './shared/local.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    })],
  controllers: [
    AuthController,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule { }