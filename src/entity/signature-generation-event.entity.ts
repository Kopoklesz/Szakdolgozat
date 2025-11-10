import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Webshop } from './webshop.entity';
import { User } from './user.entity';
import { SignatureCode } from './signature-code.entity';
import { SignatureQR } from './signature-qr.entity';

export enum GenerationType {
    CODE = 'code',
    QR = 'qr',
    DIRECT = 'direct'
}

@Entity()
export class SignatureGenerationEvent {
    @PrimaryGeneratedColumn()
    event_id: number;

    @ManyToOne(() => Webshop, { eager: true })
    @JoinColumn({ name: 'webshop_id' })
    webshop: Webshop;

    @Column()
    webshop_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'teacher_id' })
    teacher: User;

    @Column()
    teacher_id: number;

    @Column({
        type: 'enum',
        enum: GenerationType
    })
    generation_type: GenerationType;

    @Column()
    total_codes: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    code_value: number;

    @Column({ type: 'date' })
    expiry_date: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @OneToMany(() => SignatureCode, code => code.event)
    codes: SignatureCode[];

    @OneToMany(() => SignatureQR, qr => qr.event)
    qrs: SignatureQR[];
}