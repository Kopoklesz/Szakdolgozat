import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Webshop } from './webshop.entity';
import { User } from './user.entity';

@Entity('webshop_partner')
@Unique(['webshop', 'partner'])
export class WebshopPartner {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Webshop, webshop => webshop.partners, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'webshop_id' })
  webshop: Webshop;

  @Column()
  webshop_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_teacher_id' })
  partner: User;

  @Column()
  partner_teacher_id: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  added_at: Date;

  @Column({ nullable: true })
  added_by: number;
}