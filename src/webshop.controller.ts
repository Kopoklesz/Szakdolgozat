import { Controller, Get, Post, Body, Param, ParseIntPipe, UseFilters, HttpException, HttpStatus } from '@nestjs/common';
import { WebshopService } from './webshop.service';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { Webshop } from './webshop.entity';

@Controller('webshop')
@UseFilters(new HttpExceptionFilter())
export class WebshopController {
  constructor(private readonly webshopService: WebshopService) {}

  @Post()
  async createWebshop(@Body() webshopData: Partial<Webshop>) {
    try {
      return await this.webshopService.createWebshop(webshopData);
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Failed to create webshop', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  getDefaultWebshop() {
    return this.webshopService.getWebshop(0);
  }

  @Get(':id')
  getWebshop(@Param('id', ParseIntPipe) id: number) {
    console.log(`Received request for webshop with ID: ${id}`);
    return this.webshopService.getWebshop(id);
  }

  @Get(':id/products')
  getProducts(@Param('id', ParseIntPipe) id: number) {
    return this.webshopService.getProducts(id);
  }

  @Get(':id/categories')
  getCategories(@Param('id', ParseIntPipe) id: number) {
    return this.webshopService.getCategories(id);
  }
}