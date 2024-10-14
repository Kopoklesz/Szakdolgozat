import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserBalance } from './user-balance.entity';
import { Cart } from './cart.entity';
import { Purchase } from './purchase.entity';
import { Webshop } from './webshop.entity';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT
  })
  role: UserRole;

  @OneToMany(() => UserBalance, userBalance => userBalance.user)
  balances: UserBalance[];

  @OneToMany(() => Cart, cart => cart.user)
  carts: Cart[];

  @OneToMany(() => Purchase, purchase => purchase.user)
  purchases: Purchase[];

  @OneToMany(() => Webshop, webshop => webshop.teacher)
  webshops: Webshop[];
}