import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Az ár nem lehet negatív' })
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'A maximális készlet nem lehet negatív' })
  max_stock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'A jelenlegi készlet nem lehet negatív' })
  current_stock?: number;

  @IsOptional()
  @IsEnum(['available', 'unavailable'])
  status?: 'available' | 'unavailable';
}