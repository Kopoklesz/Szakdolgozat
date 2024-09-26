import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webshop } from './webshop.entity';
import { Product } from './product.entity';

@Injectable()
export class WebshopService {
  constructor(
    @InjectRepository(Webshop)
    private webshopRepository: Repository<Webshop>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getWebshop(id: number): Promise<Webshop> {
    try {
      console.log(`Fetching webshop with ID: ${id}`);
      const webshop = await this.webshopRepository.findOne({
        where: { webshop_id: id },
      });
      console.log(`Webshop found:`, webshop);
      if (!webshop) {
        console.log(`Webshop with ID ${id} not found`);
        throw new NotFoundException(`Webshop with ID ${id} not found`);
      }
      return webshop;
    } catch (error) {
      console.error('Error in getWebshop:', error);
      throw error;
    }
  }
  
  async getProducts(webshopId: number): Promise<Product[]> {
    try {
      const products = await this.productRepository.find({ 
        where: { webshop: { webshop_id: webshopId }, status: 'available' },
        order: { upload_date: 'DESC' }
      });
      if (products.length === 0) {
        throw new NotFoundException(`No products found for webshop with ID ${webshopId}`);
      }
      return products;
    } catch (error) {
      console.error('Error in getProducts:', error);
      throw error;
    }
  }
  
  async getCategories(webshopId: number): Promise<string[]> {
    try {
      const products = await this.productRepository.find({
        where: { webshop: { webshop_id: webshopId }, status: 'available' },
        select: ['category'],
      });
      if (products.length === 0) {
        throw new NotFoundException(`No categories found for webshop with ID ${webshopId}`);
      }
      return [...new Set(products.map(product => product.category))];
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }
}