import { IsOptional, IsString, IsNumber, IsPositive, IsUrl, IsEnum } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  max_stock?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  current_stock?: number;

  @IsOptional()
  @IsEnum(['available', 'unavailable'])
  status?: 'available' | 'unavailable';
}