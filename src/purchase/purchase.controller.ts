import { Controller, Post, Get, Param, ParseIntPipe, UseFilters, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entity/user.entity';

@Controller('purchase')
@UseFilters(new HttpExceptionFilter())
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  /**
   * Vásárlás létrehozása
   * POST /purchase/:userId/:webshopId
   */
  @Post(':userId/:webshopId')
  @UseGuards(JwtAuthGuard)
  async createPurchase(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('webshopId', ParseIntPipe) webshopId: number,
  ) {
    try {
      const result = await this.purchaseService.createPurchase(userId, webshopId);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw new HttpException(
        error.message || 'Failed to create purchase',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Felhasználó összes vásárlási előzményének lekérése
   * GET /purchase/user/:userId
   */
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserPurchases(@Param('userId', ParseIntPipe) userId: number) {
    try {
      return await this.purchaseService.getUserPurchases(userId);
    } catch (error) {
      throw new HttpException('Failed to fetch purchase history', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Felhasználó vásárlási előzményei egy adott webshopban
   * GET /purchase/user/:userId/webshop/:webshopId
   */
  @Get('user/:userId/webshop/:webshopId')
  @UseGuards(JwtAuthGuard)
  async getUserPurchasesByWebshop(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('webshopId', ParseIntPipe) webshopId: number,
  ) {
    try {
      return await this.purchaseService.getUserPurchasesByWebshop(userId, webshopId);
    } catch (error) {
      throw new HttpException('Failed to fetch purchase history', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Webshop összes vásárlásának lekérése (csak tanár és admin)
   * GET /purchase/webshop/:webshopId
   */
  @Get('webshop/:webshopId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getWebshopPurchases(@Param('webshopId', ParseIntPipe) webshopId: number) {
    try {
      return await this.purchaseService.getWebshopPurchases(webshopId);
    } catch (error) {
      throw new HttpException('Failed to fetch webshop purchases', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Vásárlási statisztika (csak tanár és admin)
   * GET /purchase/webshop/:webshopId/stats
   */
  @Get('webshop/:webshopId/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getPurchaseStats(@Param('webshopId', ParseIntPipe) webshopId: number) {
    try {
      return await this.purchaseService.getPurchaseStats(webshopId);
    } catch (error) {
      throw new HttpException('Failed to fetch purchase stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}