import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SignatureGenerationEvent } from './signature-generation-event.entity';
import { User } from './user.entity';

@Entity()
export class SignatureCode {
    @PrimaryGeneratedColumn()
    code_id: number;

    @ManyToOne(() => SignatureGenerationEvent, event => event.codes)
    @JoinColumn({ name: 'event_id' })
    event: SignatureGenerationEvent;

    @Column()
    event_id: number;

    @Column({ type: 'varchar', length: 8, unique: true })
    code: string;

    @Column({ type: 'boolean', default: false })
    is_redeemed: boolean;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'redeemed_by' })
    redeemedBy: User;

    @Column({ nullable: true })
    redeemed_by: number;

    @Column({ type: 'timestamp', nullable: true })
    redeemed_at: Date;
}