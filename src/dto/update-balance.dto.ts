import { IsNumber, Min } from 'class-validator';

export class UpdateBalanceDto {
  @IsNumber({}, { message: 'Az egyenlegnek számnak kell lennie' })
  @Min(0, { message: 'Az egyenleg nem lehet negatív' })
  amount: number;
}