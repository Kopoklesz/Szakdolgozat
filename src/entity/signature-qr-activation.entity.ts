import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SignatureQR } from './signature-qr.entity';
import { User } from './user.entity';

@Entity()
export class SignatureQRActivation {
    @PrimaryGeneratedColumn()
    activation_id: number;

    @ManyToOne(() => SignatureQR, qr => qr.activations)
    @JoinColumn({ name: 'qr_id' })
    qr: SignatureQR;

    @Column()
    qr_id: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    user_id: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    activated_at: Date;
}