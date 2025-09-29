import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entity/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
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
      where: { webshop: { webshop_id: webshopId } },
      relations: ['webshop'],
      order: { upload_date: 'DESC' },
    });
  }

  /**
   * Termék frissítése
   */
  async updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.getProduct(id);

    // Ellenőrizzük a készlet konzisztenciát
    if (updateProductDto.current_stock !== undefined && updateProductDto.max_stock !== undefined) {
      if (updateProductDto.current_stock > updateProductDto.max_stock) {
        throw new BadRequestException('A jelenlegi készlet nem lehet nagyobb, mint a maximális készlet');
      }
    } else if (updateProductDto.current_stock !== undefined) {
      if (updateProductDto.current_stock > product.max_stock) {
        throw new BadRequestException('A jelenlegi készlet nem lehet nagyobb, mint a maximális készlet');
      }
    } else if (updateProductDto.max_stock !== undefined) {
      if (product.current_stock > updateProductDto.max_stock) {
        throw new BadRequestException('A maximális készlet nem lehet kisebb, mint a jelenlegi készlet');
      }
    }

    Object.assign(product, updateProductDto);

    return await this.productRepository.save(product);
  }

  /**
   * Termék törlése
   */
  async deleteProduct(id: number): Promise<{ message: string }> {
    const product = await this.getProduct(id);
    await this.productRepository.remove(product);
    return { message: `Product with ID ${id} has been deleted` };
  }

  /**
   * Készlet csökkentése vásárlás során
   */
  async decreaseStock(productId: number, quantity: number): Promise<Product> {
    const product = await this.getProduct(productId);

    if (product.current_stock < quantity) {
      throw new BadRequestException(
        `Nincs elég készlet a termékből: ${product.name}. Elérhető: ${product.current_stock}, kért: ${quantity}`
      );
    }

    product.current_stock -= quantity;

    // Ha elfogy a készlet, inaktiváljuk
    if (product.current_stock === 0) {
      product.status = 'unavailable';
    }

    return await this.productRepository.save(product);
  }

  /**
   * Készlet növelése (pl. visszavonás esetén)
   */
  async increaseStock(productId: number, quantity: number): Promise<Product> {
    const product = await this.getProduct(productId);

    product.current_stock += quantity;

    // Ha volt készlet, aktiváljuk
    if (product.current_stock > 0 && product.status === 'unavailable') {
      product.status = 'available';
    }

    return await this.productRepository.save(product);
  }

  /**
   * Készlet ellenőrzése több termékre
   */
  async checkStockAvailability(items: { productId: number; quantity: number }[]): Promise<boolean> {
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product.current_stock < item.quantity) {
        return false;
      }
    }
    return true;
  }
}