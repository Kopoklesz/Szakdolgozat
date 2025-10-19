import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../entity/user.entity';
import { PasswordService } from './password.service';
import { RegisterDto, LoginDto, CreateUserDto, UserResponseDto, LoginResponseDto, JwtPayload, ChangePasswordDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private passwordService: PasswordService,
    private jwtService: JwtService,
  ) { }

  /**
   * Felhasználó regisztráció
   */
  async register(registerDto: RegisterDto): Promise<LoginResponseDto> {
    const { username, email, password } = registerDto;

    // Neptune kód validáció
    const neptuneValidation = this.passwordService.validateNeptuneCode(username);
    if (!neptuneValidation.isValid) {
      throw new BadRequestException(neptuneValidation.error);
    }

    // Email domain validáció
    const emailValidation = this.passwordService.validateEmailDomain(email);
    if (!emailValidation.isValid) {
      throw new BadRequestException(emailValidation.error);
    }

    // Jelszó komplexitás validáció
    const passwordValidation = this.passwordService.validatePasswordComplexity(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException(passwordValidation.errors.join(', '));
    }

    // Ellenőrizzük, hogy a username vagy email már létezik-e
    const existingUser = await this.userRepository.findOne({
      where: [
        { username },
        { email }
      ]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('Ez a Neptune kód már regisztrálva van');
      }
      if (existingUser.email === email) {
        throw new ConflictException('Ez az email cím már regisztrálva van');
      }
    }

    // Szerepkör meghatározása email alapján
    const role = this.passwordService.determineRoleFromEmail(email);

    // Jelszó hash-elése
    const hashedPassword = await this.passwordService.hashPassword(password);

    // Felhasználó létrehozása
    const newUser = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      role: role as UserRole,
    });

    const savedUser = await this.userRepository.save(newUser);

    // JWT token generálása és bejelentkeztetés
    return this.generateLoginResponse(savedUser);
  }

  /**
   * Felhasználó bejelentkezés
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { identifier, password } = loginDto;

    // Keresés username vagy email alapján
    const user = await this.userRepository.findOne({
      where: [
        { username: identifier },
        { email: identifier }
      ]
    });

    if (!user) {
      throw new UnauthorizedException('Érvénytelen felhasználónév vagy jelszó');
    }

    // Jelszó ellenőrzése
    const isPasswordValid = await this.passwordService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Érvénytelen felhasználónév vagy jelszó');
    }

    return this.generateLoginResponse(user);
  }

  /**
   * Felhasználó validáció JWT token alapján
   */
  async validateUser(payload: JwtPayload): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { user_id: payload.sub }
    });

    if (!user) {
      throw new UnauthorizedException('Érvénytelen token');
    }

    return this.transformToResponseDto(user);
  }

  /**
   * Felhasználó keresése ID alapján
   */
  async findUserById(userId: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['balances', 'webshops']
    });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    return this.transformToResponseDto(user);
  }

  /**
   * Jelszó változtatás
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({
      where: { user_id: userId }
    });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    // Jelenlegi jelszó ellenőrzése
    const isCurrentPasswordValid = await this.passwordService.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Helytelen jelenlegi jelszó');
    }

    // Új jelszó validáció
    const passwordValidation = this.passwordService.validatePasswordComplexity(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestException(passwordValidation.errors.join(', '));
    }

    // Új jelszó hash-elése és mentése
    const hashedNewPassword = await this.passwordService.hashPassword(newPassword);
    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    return { message: 'Jelszó sikeresen megváltoztatva' };
  }

  /**
   * Összes felhasználó lekérése (admin funkció)
   */
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      order: { created_at: 'DESC' }
    });

    return users.map(user => this.transformToResponseDto(user));
  }

  /**
   * Felhasználó törlése (admin funkció)
   */
  async deleteUser(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId }
    });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Admin felhasználót nem lehet törölni');
    }

    await this.userRepository.remove(user);
    return { message: 'Felhasználó sikeresen törölve' };
  }

  /**
   * Felhasználó szerepkörének módosítása (admin funkció)
   */
  async updateUserRole(userId: number, newRole: UserRole): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId }
    });

    if (!user) {
      throw new NotFoundException('Felhasználó nem található');
    }

    user.role = newRole;
    const updatedUser = await this.userRepository.save(user);

    return this.transformToResponseDto(updatedUser);
  }

  /**
   * JWT token és felhasználói adatok generálása
   */
  private async generateLoginResponse(user: User): Promise<LoginResponseDto> {
    const payload: JwtPayload = {
      sub: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role as 'student' | 'teacher' | 'admin',
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: this.transformToResponseDto(user),
    };
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