import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webshop, WebshopStatus } from '../entity/webshop.entity';
import { User, UserRole } from '../entity/user.entity';
import { CreateWebshopDto } from '../dto/create-webshop.dto';
import { UpdateWebshopDto } from '../dto/update-webshop.dto';

@Injectable()
export class WebshopService {
  constructor(
    @InjectRepository(Webshop)
    private webshopRepository: Repository<Webshop>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  /**
   * Összes webshop lekérése
   */
  async getAllWebshops(): Promise<Webshop[]> {
    return await this.webshopRepository.find();
  }

  /**
   * Új webshop létrehozása teacher_id-vel
   */
  async createWebshop(teacherId: number, createWebshopDto: CreateWebshopDto): Promise<Webshop> {
    // Ellenőrizzük, hogy létezik-e a tanár
    const teacher = await this.userRepository.findOne({
      where: { user_id: teacherId }
    });

    if (!teacher) {
      console.error(`Teacher not found with ID: ${teacherId}`);
      throw new NotFoundException(`A megadott tanár (ID: ${teacherId}) nem található az adatbázisban`);
    }

    console.log(`Teacher found: ID=${teacher.user_id}, username=${teacher.username}, role=${teacher.role}`);

    // Ellenőrizzük, hogy a user tanár vagy admin szerepkörű-e
    if (teacher.role !== UserRole.TEACHER && teacher.role !== UserRole.ADMIN) {
      console.error(`User ${teacherId} is not a teacher or admin. Role: ${teacher.role}`);
      throw new ForbiddenException(`Csak tanár vagy admin hozhat létre webshopot. Jelenlegi szerepkör: ${teacher.role}`);
    }

    const { subject_name, header_color_code, paying_instrument, paying_instrument_icon, status } = createWebshopDto;

    console.log('Creating webshop with data:', {
      teacher_id: teacherId,
      subject_name,
      paying_instrument,
      header_color_code,
      status
    });

    const newWebshop = new Webshop();
    newWebshop.subject_name = subject_name;
    newWebshop.header_color_code = header_color_code;
    newWebshop.paying_instrument = paying_instrument;
    newWebshop.paying_instrument_icon = paying_instrument_icon;
    newWebshop.status = status as WebshopStatus;
    newWebshop.teacher_id = teacherId;

    try {
      const savedWebshop = await this.webshopRepository.save(newWebshop);
      console.log('Webshop successfully created:', savedWebshop.webshop_id);
      return savedWebshop;
    } catch (error) {
      console.error('Database error creating webshop:', error);

      // Részletesebb hibaüzenet az adatbázis hibáknál
      if (error.code === '23503') { // Foreign key constraint violation
        throw new BadRequestException('Adatbázis integritási hiba: A tanár nem található');
      }
      if (error.code === '23505') { // Unique constraint violation
        throw new BadRequestException('Már létezik webshop ezekkel az adatokkal');
      }

      throw new BadRequestException(`Hiba történt a webshop létrehozása során: ${error.message}`);
    }
  }

  /**
   * Egy webshop lekérése
   */
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

  /**
   * Webshop kategóriák lekérése
   */
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

  /**
   * Webshop módosítása ownership ellenőrzéssel
   */
  async updateWebshop(
    userId: number,
    userRole: UserRole,
    webshopId: number,
    updateWebshopDto: UpdateWebshopDto
  ): Promise<Webshop> {
    // Ownership ellenőrzés
    await this.checkOwnership(webshopId, userId, userRole);

    const webshop = await this.webshopRepository.findOne({
      where: { webshop_id: webshopId }
    });

    if (!webshop) {
      throw new NotFoundException(`Webshop with ID ${webshopId} not found`);
    }

    Object.assign(webshop, updateWebshopDto);

    return await this.webshopRepository.save(webshop);
  }

  /**
   * Webshop törlése ownership ellenőrzéssel
   */
  async deleteWebshop(
    userId: number,
    userRole: UserRole,
    webshopId: number
  ): Promise<void> {
    // Ownership ellenőrzés
    await this.checkOwnership(webshopId, userId, userRole);

    const webshop = await this.webshopRepository.findOne({
      where: { webshop_id: webshopId }
    });

    if (!webshop) {
      throw new NotFoundException(`Webshop with ID ${webshopId} not found`);
    }

    await this.webshopRepository.remove(webshop);
  }

  /**
   * Ownership ellenőrzés - csak saját webshop módosítható (kivéve ADMIN)
   */
  private async checkOwnership(
    webshopId: number,
    userId: number,
    userRole: UserRole
  ): Promise<void> {
    // Admin mindent csinálhat
    if (userRole === UserRole.ADMIN) {
      return;
    }

    const webshop = await this.webshopRepository.findOne({
      where: { webshop_id: webshopId }
    });

    if (!webshop) {
      throw new NotFoundException(`Webshop with ID ${webshopId} not found`);
    }

    // Teacher csak saját webshopját módosíthatja
    if (webshop.teacher_id !== userId) {
      throw new ForbiddenException('Csak a saját webshopod módosíthatod');
    }
  }
}