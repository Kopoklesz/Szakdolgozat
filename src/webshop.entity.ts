import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Webshop {
  @PrimaryGeneratedColumn()
  webshop_id: number;

  @Column()
  teacher_id: number;

  @Column()
  subject_name: string;

  @Column()
  paying_instrument: string;

  @Column()
  header_color_code: string;

  @Column({ nullable: true })
  paying_device_image: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  creation_date: Date;

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => Product, product => product.webshop)
  products: Product[];
}