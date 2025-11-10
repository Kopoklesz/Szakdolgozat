import { IsInt, IsPositive } from 'class-validator';

export class AddPartnerDto {
  @IsInt()
  @IsPositive()
  partner_teacher_id: number;
}

export class RemovePartnerDto {
  @IsInt()
  @IsPositive()
  partner_teacher_id: number;
}