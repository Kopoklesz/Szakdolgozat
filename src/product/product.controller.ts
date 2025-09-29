import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseFilters, HttpException, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Controller('product')
@UseFilters(new HttpExceptionFilter())
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Termék létrehozása
   * POST /product
   */
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

  /**
   * Termék lekérése ID alapján
   * GET /product/:id
   */
  @Get(':id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.productService.getProduct(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to fetch product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Webshop összes termékének lekérése
   * GET /product/webshop/:id
   */
  @Get('webshop/:id')
  async getProductsByWebshop(@Param('id', ParseIntPipe) webshopId: number) {
    try {
      return await this.productService.getProductsByWebshop(webshopId);
    } catch (error) {
      throw new HttpException('Failed to fetch products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Termék frissítése
   * PUT /product/:id
   */
  @Put(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ) {
    try {
      return await this.productService.updateProduct(id, updateProductDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof BadRequestException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Failed to update product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Termék törlése
   * DELETE /product/:id
   */
  @Delete(':id')
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.productService.deleteProduct(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to delete product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}