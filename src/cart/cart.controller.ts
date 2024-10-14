import { Controller, Get, Post, Body, Param, ParseIntPipe, UseFilters, HttpException, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { AddToCartDto } from '../dto/add-to-cart.dto';

@Controller('cart')
@UseFilters(new HttpExceptionFilter())
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId/:webshopId')
  getCart(@Param('userId', ParseIntPipe) userId: number, @Param('webshopId', ParseIntPipe) webshopId: number) {
    return this.cartService.getCart(userId, webshopId);
  }

  @Post(':userId/:webshopId')
  async addToCart(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('webshopId', ParseIntPipe) webshopId: number,
    @Body() addToCartDto: AddToCartDto
  ) {
    try {
      return await this.cartService.addToCart(userId, webshopId, addToCartDto);
    } catch (error) {
      throw new HttpException('Failed to add item to cart', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}