import { IsOptional, IsString, IsHexColor, IsEnum } from 'class-validator';
import { WebshopStatus } from '../entity/webshop.entity';

export class UpdateWebshopDto {
  @IsOptional()
  @IsString()
  subject_name?: string;

  @IsOptional()
  @IsString()
  paying_instrument?: string;

  @IsOptional()
  @IsHexColor()
  header_color_code?: string;

  @IsOptional()
  @IsString()
  paying_instrument_icon?: string;

  @IsOptional()
  @IsEnum(WebshopStatus)
  status?: WebshopStatus;
}