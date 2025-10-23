import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Body, 
  Param, 
  ParseIntPipe, 
  UseFilters, 
  UseGuards,
  Request,
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { UserService } from './user.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { CreateUserDto, UserResponseDto } from '../dto/auth.dto';
import { UpdateBalanceDto } from '../dto/update-balance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entity/user.entity';

@Controller('user')
@UseFilters(new HttpExceptionFilter())
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Felhasználó létrehozása (csak admin)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Felhasználó lekérése ID alapján
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getUser(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.userService.getUser(id);
  }

  /**
   * Összes felhasználó lekérése (csak admin)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllUsers(): Promise<UserResponseDto[]> {
    return this.userService.getAllUsers();
  }

  /**
   * Felhasználó egyenlegének lekérése
   */
  @Get(':userId/balance/:webshopId')
  @UseGuards(JwtAuthGuard)
  async getUserBalance(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('webshopId', ParseIntPipe) webshopId: number
  ): Promise<{ balance: number }> {
    const balance = await this.userService.getUserBalance(userId, webshopId);
    return { balance };
  }

  /**
   * Felhasználó egyenlegének módosítása (csak TEACHER [saját webshop] és ADMIN)
   * PUT /user/:userId/balance/:webshopId
   */
  @Put(':userId/balance/:webshopId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async updateUserBalance(
    @Request() req,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('webshopId', ParseIntPipe) webshopId: number,
    @Body() updateBalanceDto: UpdateBalanceDto
  ): Promise<{ message: string; newBalance: number }> {
    try {
      const teacherId = req.user.sub;
      const teacherRole = req.user.role;
      return await this.userService.updateBalance(
        teacherId,
        teacherRole,
        userId,
        webshopId,
        updateBalanceDto.amount
      );
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error.status === HttpStatus.FORBIDDEN) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      }
      throw new HttpException('Failed to update balance', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Felhasználó összes egyenlegének lekérése
   */
  @Get(':userId/balances')
  @UseGuards(JwtAuthGuard)
  getUserBalances(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.getUserBalances(userId);
  }
}