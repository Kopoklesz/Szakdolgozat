import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { SignatureGenerationEvent } from './signature-generation-event.entity';
import { SignatureQRActivation } from './signature-qr-activation.entity';

@Entity()
export class SignatureQR {
    @PrimaryGeneratedColumn()
    qr_id: number;

    @ManyToOne(() => SignatureGenerationEvent, event => event.qrs)
    @JoinColumn({ name: 'event_id' })
    event: SignatureGenerationEvent;

    @Column()
    event_id: number;

    @Column({ type: 'text', unique: true })
    qr_data: string;

    @Column()
    max_activations: number;

    @Column({ default: 0 })
    current_activations: number;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @OneToMany(() => SignatureQRActivation, activation => activation.qr)
    activations: SignatureQRActivation[];
}