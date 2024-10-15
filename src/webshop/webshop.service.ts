import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webshop, WebshopStatus } from '../entity/webshop.entity';
import { CreateWebshopDto } from '../dto/create-webshop.dto';

@Injectable()
export class WebshopService {
  constructor(
    @InjectRepository(Webshop)
    private webshopRepository: Repository<Webshop>,
  ) {}

  async getAllWebshops(): Promise<Webshop[]> {
    return await this.webshopRepository.find();
  }

  async createWebshop(createWebshopDto: CreateWebshopDto): Promise<Webshop> {
    const { subject_name, header_color_code, paying_instrument, paying_instrument_icon } = createWebshopDto;

    const newWebshop = new Webshop();
    newWebshop.subject_name = subject_name;
    newWebshop.header_color_code = header_color_code;
    newWebshop.paying_instrument = paying_instrument;
    newWebshop.paying_instrument_icon = paying_instrument_icon;
    newWebshop.status = WebshopStatus.ACTIVE;
    newWebshop.teacher_id = 0; // Beállítjuk a teacher_id-t

    return await this.webshopRepository.save(newWebshop);
  }

  async getWebshop(id: number): Promise<Webshop> {
    const webshop = await this.webshopRepository.findOne({
      where: { webshop_id: id },
      relations: ['teacher', 'products'],
    });

    if (!webshop) {
      throw new NotFoundException(`Webshop with ID ${id} not found`);
    }

    return webshop;
  }

  async getCategories(webshopId: number): Promise<string[]> {
    const webshop = await this.webshopRepository.findOne({
      where: { webshop_id: webshopId },
      relations: ['products'],
    });

    if (!webshop) {
      throw new NotFoundException(`Webshop with ID ${webshopId} not found`);
    }

    const categories = webshop.products
      .filter(product => product.status === 'available')
      .map(product => product.category);

    return [...new Set(categories)];
  }
}