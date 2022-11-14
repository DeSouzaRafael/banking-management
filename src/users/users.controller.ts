import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/shared/jwt-auth.guard';
import { CallResponse } from '../dto/response.dto';
import { RegisterUserDto } from './dto/create.user.dto';
import { RegisterDepositDto } from './dto/deposit.user.dto';
import { TransferBalanceDto } from './dto/transfer.balance.user.dto';
import { Users } from './shared/users.entity';
import { UsersService } from './shared/users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('list')
    async getAllUsers(): Promise<Users[]> {
        return this.usersService.getAllUsers();
    }

    @Post('register')
    async registerUser(@Body() data: RegisterUserDto): Promise<CallResponse> {
        return this.usersService.registerUser(data)
    }

    @UseGuards(JwtAuthGuard)
    @Post('deposit')
    async deposit(@Request() req, @Body() data: RegisterDepositDto): Promise<CallResponse> {
        return this.usersService.deposit(req, data);
    }

    @UseGuards(JwtAuthGuard)
    @Post('transfer')
    async transfer(@Request() req, @Body() data: TransferBalanceDto): Promise<CallResponse> {
        return this.usersService.transfer(req, data);
    }
}