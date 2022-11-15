import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './shared/users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './shared/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule { }
