import { Controller, Get, Post, Body, Param, ParseIntPipe, UseFilters, HttpException, HttpStatus } from '@nestjs/common';
import { WebshopService } from './webshop.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { CreateWebshopDto } from '../dto/create-webshop.dto';

@Controller('webshop')
@UseFilters(new HttpExceptionFilter())
export class WebshopController {
  constructor(private readonly webshopService: WebshopService) {}

  @Get()
  async getAllWebshops() {
    try {
      return await this.webshopService.getAllWebshops();
    } catch (error) {
      throw new HttpException('Failed to fetch webshops', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async createWebshop(@Body() createWebshopDto: CreateWebshopDto) {
    try {
      return await this.webshopService.createWebshop(createWebshopDto);
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Failed to create webshop', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  getWebshop(@Param('id', ParseIntPipe) id: number) {
    return this.webshopService.getWebshop(id);
  }

  @Get(':id/categories')
  getCategories(@Param('id', ParseIntPipe) id: number) {
    return this.webshopService.getCategories(id);
  }
}