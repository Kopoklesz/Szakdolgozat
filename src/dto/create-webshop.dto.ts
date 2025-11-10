import { IsNotEmpty, IsString, IsHexColor, IsEnum, IsOptional } from 'class-validator';

export enum WebshopStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export class CreateWebshopDto {
  @IsNotEmpty()
  @IsString()
  subject_name: string;

  @IsNotEmpty()
  @IsHexColor()
  header_color_code: string;

  @IsNotEmpty()
  @IsString()
  paying_instrument: string;

  @IsOptional()
  @IsString()
  paying_instrument_icon: string;

  @IsNotEmpty()
  @IsEnum(WebshopStatus)
  status: WebshopStatus;
}