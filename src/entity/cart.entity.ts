import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Webshop } from './webshop.entity';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  cart_id: number;

  @ManyToOne(() => User, user => user.carts)
  user: User;

  @ManyToOne(() => Webshop)
  webshop: Webshop;

  @OneToMany(() => CartItem, cartItem => cartItem.cart)
  items: CartItem[];
}