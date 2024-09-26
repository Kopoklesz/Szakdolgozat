import { Controller, Get, Param, ParseIntPipe, UseFilters } from '@nestjs/common';
import { WebshopService } from './webshop.service';
import { HttpExceptionFilter } from './filters/http-exception.filter';

@Controller('webshop')
@UseFilters(new HttpExceptionFilter())
export class WebshopController {
  constructor(private readonly webshopService: WebshopService) {}

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