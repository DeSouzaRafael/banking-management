import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import { UsersService } from '../../users/shared/users.service';
import { User } from './auth';

@Injectable()
export class AuthService {
    constructor(
      private readonly usersService: UsersService,
      private readonly jwtService: JwtService,
    ) {}

    async validateUser(userAccess: string, password: string): Promise<User> {
      const user = await this.usersService.findOne(userAccess);
      if (user && bcrypt.compareSync(password, user.password)) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    }

    async login(user: User) {
      const payload = { userAcess: user.govId, sub: user.id };
      throw new HttpException({
        access_token: this.jwtService.sign(payload),
      }, HttpStatus.OK)
    }
}