import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebshopController } from './webshop.controller';
import { WebshopService } from './webshop.service';
import { Webshop } from './webshop.entity';
import { Product } from './product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Webshop, Product])],
  controllers: [WebshopController],
  providers: [WebshopService],
})
export class WebshopModule {}