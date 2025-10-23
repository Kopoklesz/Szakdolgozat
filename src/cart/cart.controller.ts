import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  ParseIntPipe, 
  UseFilters, 
  UseGuards,
  Request,
  HttpException, 
  HttpStatus,
  ForbiddenException
} from '@nestjs/common';
import { CartService } from './cart.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../entity/user.entity';

@Controller('cart')
@UseFilters(new HttpExceptionFilter())
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Kosár tartalmának lekérése
   * Csak saját kosarat lehet lekérni (kivéve ADMIN)
   * GET /cart/:userId/:webshopId
   */
  @Get(':userId/:webshopId')
  @UseGuards(JwtAuthGuard)
  async getCart(
    @Request() req,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('webshopId', ParseIntPipe) webshopId: number
  ) {
    // Ellenőrzés: csak saját kosarat lehet lekérni (kivéve ADMIN)
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== userId) {
      throw new ForbiddenException('Csak a saját kosarad tartalmát tekintheted meg');
    }

    return this.cartService.getCart(userId, webshopId);
  }

  /**
   * Kosárba tétel / mennyiség módosítás
   * Csak saját kosárba lehet tenni (kivéve ADMIN)
   * POST /cart/:userId/:webshopId
   */
  @Post(':userId/:webshopId')
  @UseGuards(JwtAuthGuard)
  async addToCart(
    @Request() req,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('webshopId', ParseIntPipe) webshopId: number,
    @Body() addToCartDto: AddToCartDto
  ) {
    // Ellenőrzés: csak saját kosárba lehet tenni (kivéve ADMIN)
    if (req.user.role !== UserRole.ADMIN && req.user.sub !== userId) {
      throw new ForbiddenException('Csak a saját kosaradba tehetsz termékeket');
    }

    try {
      return await this.cartService.addToCart(userId, webshopId, addToCartDto);
    } catch (error) {
      throw new HttpException('Failed to add item to cart', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}