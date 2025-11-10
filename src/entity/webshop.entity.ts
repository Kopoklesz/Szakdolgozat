import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';
import { WebshopPartner } from './webshop-partner.entity';

export enum WebshopStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

@Entity()
export class Webshop {
  @PrimaryGeneratedColumn()
  webshop_id: number;

  @ManyToOne(() => User, user => user.webshops)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column()
  teacher_id: number;

  @Column()
  subject_name: string;

  @Column()
  paying_instrument: string;

  @Column()
  paying_instrument_icon: string;

  @Column()
  header_color_code: string;

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

  @OneToMany(() => WebshopPartner, partner => partner.webshop)
  partners: WebshopPartner[];
}