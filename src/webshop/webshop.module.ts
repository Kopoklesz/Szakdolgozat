import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebshopController } from './webshop.controller';
import { WebshopService } from './webshop.service';
import { Webshop } from '../entity/webshop.entity';
import { User } from '../entity/user.entity';
import { WebshopPartner } from '../entity/webshop-partner.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Webshop,
      User,
      WebshopPartner
    ])
  ],
  controllers: [WebshopController],
  providers: [WebshopService],
  exports: [WebshopService],
})
export class WebshopModule { }