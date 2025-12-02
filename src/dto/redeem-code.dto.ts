import { IsString, Length } from 'class-validator';

export class RedeemCodeDto {
    @IsString()
    @Length(8, 8)
    code: string;
}