import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

export enum WebshopStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

@Entity()
export class Webshop {
  @PrimaryGeneratedColumn()
  webshop_id: number;

  @ManyToOne(() => User, user => user.webshops)
  teacher: User;

  @Column()
  subject_name: string;

  @Column()
  header_color_code: string;

  @Column()
  paying_instrument: string;

  @Column()
  paying_instrument_icon: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  creation_date: Date;

  @Column({
    type: 'enum',
    enum: WebshopStatus,
    default: WebshopStatus.ACTIVE
  })
  status: WebshopStatus;

  @OneToMany(() => Product, product => product.webshop)
  products: Product[];
}