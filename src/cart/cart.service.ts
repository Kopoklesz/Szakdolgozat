import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  /**
   * Kosár lekérése
   */
  async getCart(userId: number, webshopId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { user_id: userId }, webshop: { webshop_id: webshopId } },
      relations: ['items', 'items.product', 'items.product.webshop'],
    });

    // Ha nincs kosár, létrehozzuk
    if (!cart) {
      cart = this.cartRepository.create({
        user: { user_id: userId },
        webshop: { webshop_id: webshopId },
        items: [],
      });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  /**
   * Termék hozzáadása a kosárhoz
   */
  async addToCart(userId: number, webshopId: number, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity } = addToCartDto;

    if (quantity < 0) {
      throw new BadRequestException('A mennyiség nem lehet negatív');
    }

    // Kosár lekérése vagy létrehozása
    let cart = await this.cartRepository.findOne({
      where: { user: { user_id: userId }, webshop: { webshop_id: webshopId } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user: { user_id: userId },
        webshop: { webshop_id: webshopId },
      });
      cart = await this.cartRepository.save(cart);
    }

    // Meglévő cart item keresése
    const existingCartItem = await this.cartItemRepository.findOne({
      where: { 
        cart: { cart_id: cart.cart_id }, 
        product: { product_id: productId } 
      },
    });

    if (quantity === 0) {
      // Ha a mennyiség 0, töröljük a terméket
      if (existingCartItem) {
        await this.cartItemRepository.remove(existingCartItem);
      }
    } else {
      if (existingCartItem) {
        // Meglévő item frissítése
        existingCartItem.quantity = quantity;
        await this.cartItemRepository.save(existingCartItem);
      } else {
        // Új item létrehozása
        const newCartItem = this.cartItemRepository.create({
          cart: cart,
          product: { product_id: productId },
          quantity: quantity,
        });
        await this.cartItemRepository.save(newCartItem);
      }
    }

    return this.getCart(userId, webshopId);
  }

  /**
   * Kosár ürítése vásárlás után
   */
  async clearCart(userId: number, webshopId: number): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { user: { user_id: userId }, webshop: { webshop_id: webshopId } },
      relations: ['items'],
    });

    if (cart && cart.items && cart.items.length > 0) {
      // Összes cart item törlése
      await this.cartItemRepository.remove(cart.items);
    }
  }

  /**
   * Kosár tételszám lekérése
   */
  async getCartItemCount(userId: number, webshopId: number): Promise<number> {
    const cart = await this.getCart(userId, webshopId);
    return cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }

  /**
   * Kosár összértéke
   */
  async getCartTotal(userId: number, webshopId: number): Promise<number> {
    const cart = await this.getCart(userId, webshopId);
    return cart.items?.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    ) || 0;
  }
}