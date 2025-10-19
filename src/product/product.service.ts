import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entity/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Webshop } from '../entity/webshop.entity';
import { UserRole } from '../entity/user.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Webshop)
    private webshopRepository: Repository<Webshop>,
  ) { }

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
      relations: ['webshop'],
      order: { upload_date: 'DESC' },
    });
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

  /**
   * HELPER: Ownership ellenőrzés
   * Ellenőrzi, hogy a felhasználó módosíthatja/törölheti-e a terméket
   */
  private async checkProductOwnership(
    productId: number,
    userId: number,
    userRole: UserRole
  ): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { product_id: productId },
      relations: ['webshop'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // ADMIN mindent módosíthat/törölhet
    if (userRole === UserRole.ADMIN) {
      return;
    }

    // TEACHER csak saját webshopjának termékeit módosíthatja/törölheti
    if (product.webshop.teacher_id !== userId) {
      throw new ForbiddenException('Csak a saját webshopod termékeit módosíthatod/törölheted');
    }
  }
}