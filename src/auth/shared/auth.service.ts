import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import { Users } from 'src/users/shared/users.entity';
import { UsersService } from '../../users/shared/users.service';

@Injectable()
export class AuthService {
    constructor(
      private usersService: UsersService,
      private jwtService: JwtService,
    ) {}

    async validateUser(userAccess: string, password: string): Promise<any> {
      const user = await this.usersService.findOne(userAccess);
      if (user && bcrypt.compareSync(password, user.password)) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    }

    async login(user: any) {
      const payload = { userAcess: user.govId, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
}