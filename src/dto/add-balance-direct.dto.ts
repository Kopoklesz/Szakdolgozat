import { IsInt, IsNumber, IsArray, Min } from 'class-validator';

export class AddBalanceDirectDto {
    @IsInt()
    @Min(1)
    webshopId: number;

    @IsArray()
    @IsInt({ each: true })
    userIds: number[];

    @IsNumber()
    @Min(0.01)
    amount: number;
}