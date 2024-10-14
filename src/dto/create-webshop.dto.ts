import { IsNotEmpty, IsString, IsHexColor } from 'class-validator';

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

  @IsNotEmpty()
  @IsString()
  paying_instrument_icon: string;
}