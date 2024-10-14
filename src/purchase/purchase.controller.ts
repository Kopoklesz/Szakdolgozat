import { Controller, Get, Post, Param, ParseIntPipe, UseFilters, HttpException, HttpStatus } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';

@Controller('purchase')
@UseFilters(new HttpExceptionFilter())
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post(':userId/:webshopId')
  async createPurchase(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('webshopId', ParseIntPipe) webshopId: number
  ) {
    try {
      return await this.purchaseService.createPurchase(userId, webshopId);
    } catch (error) {
      throw new HttpException('Failed to create purchase', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':userId')
  getUserPurchases(@Param('userId', ParseIntPipe) userId: number) {
    return this.purchaseService.getUserPurchases(userId);
  }
}