import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SignatureService } from './signature.service';

@Injectable()
export class SignatureCleanupTask {
    constructor(private readonly signatureService: SignatureService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleExpiredCodes() {
        console.log('🧹 Lejárt kódok és QR-ok törlése - Cron job indítva...');

        try {
            const result = await this.signatureService.cleanupExpiredCodes();
            console.log(`✅ Cleanup sikeres: ${result.deletedCodes} kód és ${result.deletedQRs} QR törölve`);
        } catch (error) {
            console.error('❌ Hiba a cleanup során:', error);
        }
    }
}