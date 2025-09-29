import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entity/product.entity';
import { Webshop } from '../entity/webshop.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { UserRole } from '../entity/user.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Webshop)
    private webshopRepository: Repository<Webshop>,
  ) {}

  /**
   * Termék létrehozása ownership ellenőrzéssel
   */
  async createProduct(
    userId: number,
    userRole: UserRole,
    createProductDto: CreateProductDto
  ): Promise<Product> {
    const { webshop_id, name, category, image, description, price, max_stock, current_stock, status } = createProductDto;

    // Webshop létezésének ellenőrzése
    const webshop = await this.webshopRepository.findOne({
      where: { webshop_id: webshop_id },
    });

    if (!webshop) {
      throw new NotFoundException(`Webshop with ID ${webshop_id} not found`);
    }

    // Ownership ellenőrzés - csak saját webshopba tehet terméket (kivéve ADMIN)
    if (userRole !== UserRole.ADMIN && webshop.teacher_id !== userId) {
      throw new ForbiddenException('Csak a saját webshopodba hozhatsz létre terméket');
    }

    // Validációk
    if (current_stock > max_stock) {
      throw new BadRequestException('A jelenlegi készlet nem lehet nagyobb, mint a maximális készlet');
    }

    // Termék létrehozása
    const newProduct = this.productRepository.create({
      name,
      category,
      image,
      description,
      price,
      max_stock,
      current_stock,
      status,
      webshop: webshop,
    });

    return await this.productRepository.save(newProduct);
  }

  /**
   * Termék módosítása ownership ellenőrzéssel
   */
  async updateProduct(
    userId: number,
    userRole: UserRole,
    productId: number,
    updateProductDto: UpdateProductDto
  ): Promise<Product> {
    // Ownership ellenőrzés
    await this.checkProductOwnership(productId, userId, userRole);

    const product = await this.productRepository.findOne({
      where: { product_id: productId }
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Validáció: current_stock <= max_stock
    const newMaxStock = updateProductDto.max_stock ?? product.max_stock;
    const newCurrentStock = updateProductDto.current_stock ?? product.current_stock;

    if (newCurrentStock > newMaxStock) {
      throw new BadRequestException('A jelenlegi készlet nem lehet nagyobb, mint a maximális készlet');
    }

    // Módosítások alkalmazása
    Object.assign(product, updateProductDto);

    return await this.productRepository.save(product);
  }

  /**
   * Termék törlése ownership ellenőrzéssel
   */
  async deleteProduct(
    userId: number,
    userRole: UserRole,
    productId: number
  ): Promise<{ message: string }> {
    // Ownership ellenőrzés
    await this.checkProductOwnership(productId, userId, userRole);

    const product = await this.productRepository.findOne({
      where: { product_id: productId }
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    await this.productRepository.remove(product);

    return { message: 'Termék sikeresen törölve' };
  }

  /**
   * Egy termék lekérése
   */
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

  /**
   * Webshop összes termékének lekérése
   */
  async getProductsByWebshop(webshopId: number): Promise<Product[]> {
    return await this.productRepository.find({
      where: { webshop: { webshop_id: webshopId } },
      order: { upload_date: 'DESC' },
    });
  }

  /**
   * Ownership ellenőrzés - csak saját webshop termékei módosíthatók (kivéve ADMIN)
   */
  private async checkProductOwnership(
    productId: number,
    userId: number,
    userRole: UserRole
  ): Promise<void> {
    // Admin mindent módosíthat
    if (userRole === UserRole.ADMIN) {
      return;
    }

    const product = await this.productRepository.findOne({
      where: { product_id: productId },
      relations: ['webshop']
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Teacher csak saját webshopjának termékeit módosíthatja
    if (product.webshop.teacher_id !== userId) {
      throw new ForbiddenException('Csak a saját webshopod termékeit módosíthatod');
    }
  }
}