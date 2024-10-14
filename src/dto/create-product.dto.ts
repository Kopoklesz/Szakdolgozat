import { IsNotEmpty, IsString, IsNumber, IsPositive, IsUrl, IsEnum } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsUrl()
  image: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  max_stock: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  current_stock: number;

  @IsNotEmpty()
  @IsEnum(['available', 'unavailable'])
  status: 'available' | 'unavailable';

  @IsNotEmpty()
  @IsNumber()
  webshop_id: number;
}