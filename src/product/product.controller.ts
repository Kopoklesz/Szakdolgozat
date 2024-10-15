import { Controller, Get, Post, Body, Param, ParseIntPipe, UseFilters, HttpException, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { CreateProductDto } from '../dto/create-product.dto';

@Controller('product')
@UseFilters(new HttpExceptionFilter())
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    console.log('Received create product request:', createProductDto);
    try {
      const result = await this.productService.createProduct(createProductDto);
      console.log('Product created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error in createProduct:', error);
      if (error instanceof BadRequestException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          'There was a problem creating the product: ' + error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
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