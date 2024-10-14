import { Controller, Get, Post, Body, Param, ParseIntPipe, UseFilters, HttpException, HttpStatus } from '@nestjs/common';
import { ProductService } from './product.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { CreateProductDto } from '../dto/create-product.dto';

@Controller('product')
@UseFilters(new HttpExceptionFilter())
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    try {
      return await this.productService.createProduct(createProductDto);
    } catch (error) {
      throw new HttpException('Failed to create product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProduct(id);
  }

  @Get('webshop/:id')
  getProductsByWebshop(@Param('id', ParseIntPipe) webshopId: number) {
    return this.productService.getProductsByWebshop(webshopId);
  }
}