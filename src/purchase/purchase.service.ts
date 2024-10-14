import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from '../entity/purchase.entity';
import { CartService } from '../cart/cart.service';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    private cartService: CartService,
  ) {}

  async createPurchase(userId: number, webshopId: number): Promise<Purchase[]> {
    const cart = await this.cartService.getCart(userId, webshopId);
    
    if (cart.items.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    const purchases = await Promise.all(cart.items.map(async (item) => {
      const purchase = this.purchaseRepository.create({
        user: { user_id: userId },
        product: item.product,
        quantity: item.quantity,
      });
      return await this.purchaseRepository.save(purchase);
    }));

    // Clear the cart after purchase
    //await this.cartService.clearCart(userId, webshopId);

    return purchases;
  }

  async getUserPurchases(userId: number): Promise<Purchase[]> {
    return await this.purchaseRepository.find({
      where: { user: { user_id: userId } },
      relations: ['product'],
      order: { purchase_date: 'DESC' },
    });
  }
}