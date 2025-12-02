import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignatureController } from './signature.controller';
import { SignatureService } from './signature.service';
import { SignatureCleanupTask } from './signature-cleanup.task';
import { SignatureGenerationEvent } from '../entity/signature-generation-event.entity';
import { SignatureCode } from '../entity/signature-code.entity';
import { SignatureQR } from '../entity/signature-qr.entity';
import { SignatureQRActivation } from '../entity/signature-qr-activation.entity';
import { Webshop } from '../entity/webshop.entity';
import { User } from '../entity/user.entity';
import { UserBalance } from '../entity/user-balance.entity';
import { WebshopPartner } from '../entity/webshop-partner.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SignatureGenerationEvent,
            SignatureCode,
            SignatureQR,
            SignatureQRActivation,
            Webshop,
            User,
            UserBalance,
            WebshopPartner,
        ]),
    ],
    controllers: [SignatureController],
    providers: [SignatureService, SignatureCleanupTask],
    exports: [SignatureService],
})
export class SignatureModule { }