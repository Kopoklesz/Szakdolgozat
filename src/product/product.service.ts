import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entity/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const { webshop_id, ...productData } = createProductDto;
    const newProduct = this.productRepository.create({
      ...productData,
      webshop: { webshop_id: webshop_id }
    });
    return await this.productRepository.save(newProduct);
  }

  async getProduct(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { product_id: id },
      relations: ['webshop'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async getProductsByWebshop(webshopId: number): Promise<Product[]> {
    return await this.productRepository.find({
      where: { webshop: { webshop_id: webshopId }, status: 'available' },
      order: { upload_date: 'DESC' },
    });
  }
}