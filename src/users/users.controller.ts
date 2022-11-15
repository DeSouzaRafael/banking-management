import { Body, Controller, Get, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/shared/jwt-auth.guard';
import { User, UserDeposit, UserResponse, UserTransfer } from './shared/users';
import { UsersService } from './shared/users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Post('register')
    async registerUser(@Body() data: User): Promise<UserResponse> {
        return this.usersService.registerUser(data)
    }

    @UseGuards(JwtAuthGuard)
    @Put('deposit')
    async deposit(@Request() req, @Body() data: UserDeposit): Promise<UserResponse> {
        return this.usersService.deposit(req, data);
    }

    @UseGuards(JwtAuthGuard)
    @Put('transfer')
    async transfer(@Request() req, @Body() data: UserTransfer): Promise<UserResponse> {
        return await this.usersService.transfer(req, data);

    }
}

