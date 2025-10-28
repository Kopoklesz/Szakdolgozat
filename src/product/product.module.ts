import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from '../entity/product.entity';
import { Webshop } from '../entity/webshop.entity';
import { WebshopPartner } from '../entity/webshop-partner.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Webshop,
      WebshopPartner
    ])
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule { }