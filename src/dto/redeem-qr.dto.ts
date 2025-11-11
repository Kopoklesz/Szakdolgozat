import { IsString } from 'class-validator';

export class RedeemQRDto {
    @IsString()
    qrData: string;
}