import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  LoginResponseDto,
  UserResponseDto,
} from '../dto/auth.dto';
import { UserRole } from '../entity/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  /**
   * Felhasználó regisztráció
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<LoginResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Felhasználó bejelentkezés
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * Aktuális felhasználó profil lekérése
   * GET /auth/profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<UserResponseDto> {
    // Fix: req.user.user_id használata sub helyett
    const userId = req.user?.sub || req.user?.user_id || req.user?.userId || req.user?.id;

    console.log('🔍 GET PROFILE - req.user:', req.user);
    console.log('🔍 Extracted user ID:', userId);

    if (!userId) {
      throw new HttpException('User ID not found in JWT token', HttpStatus.UNAUTHORIZED);
    }

    return this.authService.findUserById(userId);
  }

  /**
   * Jelszó megváltoztatása
   * PUT /auth/change-password
   */
  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    // Fix: req.user.user_id használata sub helyett
    const userId = req.user?.sub || req.user?.user_id || req.user?.userId || req.user?.id;

    if (!userId) {
      throw new HttpException('User ID not found in JWT token', HttpStatus.UNAUTHORIZED);
    }

    return this.authService.changePassword(userId, changePasswordDto);
  }

  /**
   * Kijelentkezés (client oldali token törlés)
   * POST /auth/logout
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<{ message: string }> {
    // JWT token esetén a kijelentkezést a client oldal kezeli (token törlés)
    // Itt csak visszajelzést adunk
    return { message: 'Sikeresen kijelentkeztél' };
  }

  // ===== ADMIN FUNKCIÓK =====

  /**
   * Összes felhasználó listázása (csak admin)
   * GET /auth/users
   */
  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.authService.getAllUsers();
  }

  /**
   * Felhasználó törlése (csak admin)
   * DELETE /auth/users/:id
   */
  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id', ParseIntPipe) userId: number): Promise<{ message: string }> {
    return this.authService.deleteUser(userId);
  }

  /**
   * Felhasználó szerepkörének módosítása (csak admin)
   * PUT /auth/users/:id/role
   */
  @Put('users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateUserRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body('role') newRole: UserRole,
  ): Promise<UserResponseDto> {
    return this.authService.updateUserRole(userId, newRole);
  }

  /**
   * Speciális felhasználó lekérése ID alapján (admin és teacher)
   * GET /auth/users/:id
   */
  @Get('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getUserById(@Param('id', ParseIntPipe) userId: number): Promise<UserResponseDto> {
    return this.authService.findUserById(userId);
  }
}