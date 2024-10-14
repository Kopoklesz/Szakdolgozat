import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebshopController } from './webshop.controller';
import { WebshopService } from './webshop.service';
import { Webshop } from '../entity/webshop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Webshop])],
  controllers: [WebshopController],
  providers: [WebshopService],
  exports: [WebshopService],
})
export class WebshopModule {}