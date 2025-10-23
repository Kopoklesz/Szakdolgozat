import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../entity/user.entity';
import { UserBalance } from '../entity/user-balance.entity';
import { Webshop } from '../entity/webshop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserBalance, Webshop])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }