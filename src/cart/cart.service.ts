import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entity/cart.entity';
import { CartItem } from '../entity/cart-item.entity';
import { AddToCartDto } from '../dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async getCart(userId: number, webshopId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { user: { user_id: userId }, webshop: { webshop_id: webshopId } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found for user ${userId} in webshop ${webshopId}`);
    }

    return cart;
  }

  async addToCart(userId: number, webshopId: number, addToCartDto: AddToCartDto): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { user_id: userId }, webshop: { webshop_id: webshopId } },
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user: { user_id: userId },
        webshop: { webshop_id: webshopId },
      });
      cart = await this.cartRepository.save(cart);
    }

    const cartItem = await this.cartItemRepository.findOne({
      where: { cart: { cart_id: cart.cart_id }, product: { product_id: addToCartDto.productId } },
    });

    if (cartItem) {
      cartItem.quantity += addToCartDto.quantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      const newCartItem = this.cartItemRepository.create({
        cart: cart,
        product: { product_id: addToCartDto.productId },
        quantity: addToCartDto.quantity,
      });
      await this.cartItemRepository.save(newCartItem);
    }

    return this.getCart(userId, webshopId);
  }
}