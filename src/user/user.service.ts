import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entity/user.entity';
import { UserBalance } from '../entity/user-balance.entity';
import { CreateUserDto, UserResponseDto } from '../dto/auth.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserBalance)
    private userBalanceRepository: Repository<UserBalance>,
  ) {}

  /**
   * Felhasználó létrehozása (belső használatra)
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // ✅ Explicit típus konverzió
    const userEntity = this.userRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password,
      role: createUserDto.role as UserRole || UserRole.STUDENT,
    });
    
    const savedUser = await this.userRepository.save(userEntity);
    
    return this.transformToResponseDto(savedUser);
  }

  /**
   * Felhasználó lekérése ID alapján (kapcsolatokkal együtt)
   */
  async getUser(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { user_id: id },
      relations: ['balances', 'balances.webshop', 'webshops', 'carts', 'purchases'],
    });

    if (!user) {
      throw new NotFoundException(`Felhasználó ${id} ID-val nem található`);
    }

    return this.transformToResponseDto(user);
  }

  /**
   * Összes felhasználó lekérése
   */
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      relations: ['balances'],
      order: { created_at: 'DESC' },
    });

    return users.map(user => this.transformToResponseDto(user));
  }

  /**
   * Felhasználó egyenlegének lekérése adott webshopban
   */
  async getUserBalance(userId: number, webshopId: number): Promise<number> {
    const balance = await this.userBalanceRepository.findOne({
      where: {
        user: { user_id: userId },
        webshop: { webshop_id: webshopId },
      },
    });

    return balance ? Number(balance.amount) : 0;
  }

  /**
   * Felhasználó egyenlegének frissítése
   */
  async updateUserBalance(userId: number, webshopId: number, amount: number): Promise<UserBalance> {
    let balance = await this.userBalanceRepository.findOne({
      where: {
        user: { user_id: userId },
        webshop: { webshop_id: webshopId },
      },
    });

    if (balance) {
      balance.amount = amount;
    } else {
      // Új egyenleg létrehozása, ha nem létezik
      balance = this.userBalanceRepository.create({
        user: { user_id: userId } as User,
        webshop: { webshop_id: webshopId } as any,
        amount: amount,
      });
    }

    return await this.userBalanceRepository.save(balance);
  }

  /**
   * Egyenleg hozzáadása/levonása
   */
  async adjustUserBalance(userId: number, webshopId: number, amountChange: number): Promise<UserBalance> {
    const currentBalance = await this.getUserBalance(userId, webshopId);
    const newBalance = currentBalance + amountChange;

    if (newBalance < 0) {
      throw new BadRequestException('Az egyenleg nem lehet negatív');
    }

    return this.updateUserBalance(userId, webshopId, newBalance);
  }

  /**
   * Felhasználó összes egyenlegének lekérése
   */
  async getUserBalances(userId: number): Promise<UserBalance[]> {
    return await this.userBalanceRepository.find({
      where: { user: { user_id: userId } },
      relations: ['webshop'],
      order: { webshop: { subject_name: 'ASC' } },
    });
  }

  /**
   * Felhasználók keresése szerepkör alapján
   */
  async getUsersByRole(role: 'student' | 'teacher' | 'admin'): Promise<UserResponseDto[]> {
    // ✅ Explicit enum konverzió
    const userRole = role === 'student' ? UserRole.STUDENT : 
                     role === 'teacher' ? UserRole.TEACHER : UserRole.ADMIN;
    
    const users = await this.userRepository.find({
      where: { role: userRole },
      order: { username: 'ASC' },
    });

    return users.map(user => this.transformToResponseDto(user));
  }

  /**
   * Felhasználó keresése username vagy email alapján
   */
  async findUserByIdentifier(identifier: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findOne({
      where: [
        { username: identifier },
        { email: identifier }
      ]
    });

    return user ? this.transformToResponseDto(user) : null;
  }

  /**
   * User entity átalakítása ResponseDto-vá (jelszó nélkül)
   */
  private transformToResponseDto(user: User): UserResponseDto {
    return {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role as 'student' | 'teacher' | 'admin',
      created_at: user.created_at,
    };
  }
}