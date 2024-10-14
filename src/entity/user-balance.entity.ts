import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Webshop } from './webshop.entity';

@Entity()
export class UserBalance {
  @PrimaryGeneratedColumn()
  balance_id: number;

  @ManyToOne(() => User, user => user.balances)
  user: User;

  @ManyToOne(() => Webshop)
  webshop: Webshop;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;
}