import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entity/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { Webshop } from '../entity/webshop.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Webshop)
    private webshopRepository: Repository<Webshop>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const { webshop_id, ...productData } = createProductDto;

    try {
      const webshop = await this.webshopRepository.findOne({ where: { webshop_id: webshop_id } });
      if (!webshop) {
        throw new NotFoundException(`Webshop with id ${webshop_id} not found`);
      }

      const newProduct = this.productRepository.create({
        ...productData,
        webshop: webshop
      });

      const savedProduct = await this.productRepository.save(newProduct);
      return savedProduct;
    } catch (error) {
      console.error('Error saving product:', error);
      throw new InternalServerErrorException(`Failed to create product: ${error.message}`);
    }
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