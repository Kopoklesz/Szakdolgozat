import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  ParseIntPipe, 
  UseFilters, 
  UseGuards,
  Request,
  HttpException, 
  HttpStatus,
  ForbiddenException
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../entity/user.entity';

@Controller('purchase')
@UseFilters(new HttpExceptionFilter())
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  /**
   * Vásárlás létrehozása (checkout)
   * Csak saját kosarából lehet vásárolni (kivéve ADMIN)
   * POST /purchase/:userId/:webshopId
   */
  @Post(':userId/:webshopId')
  @UseGuards(JwtAuthGuard)
  async createPurchase(
    @Request() req,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('webshopId', ParseIntPipe) webshopId: number
  ) {
    // Ellenőrzés: csak saját kosarából vásárolhat (kivéve ADMIN)
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== userId) {
      throw new ForbiddenException('Csak a saját kosaradból vásárolhatsz');
    }

    try {
      return await this.purchaseService.createPurchase(userId, webshopId);
    } catch (error) {
      throw new HttpException('Failed to create purchase', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Felhasználó vásárlásainak lekérése
   * Csak saját vásárlásokat lehet lekérni (kivéve ADMIN)
   * GET /purchase/:userId
   */
  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async getUserPurchases(
    @Request() req,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    // Ellenőrzés: csak saját vásárlásokat lehet lekérni (kivéve ADMIN)
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== userId) {
      throw new ForbiddenException('Csak a saját vásárlásaidat tekintheted meg');
    }

    return this.purchaseService.getUserPurchases(userId);
  }
}