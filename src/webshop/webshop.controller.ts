import {
  Controller,
  Delete,
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
import { WebshopService } from './webshop.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { CreateWebshopDto } from '../dto/create-webshop.dto';
import { UpdateWebshopDto } from '../dto/update-webshop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entity/user.entity';

@Controller('webshop')
@UseFilters(new HttpExceptionFilter())
export class WebshopController {
  constructor(private readonly webshopService: WebshopService) { }

  /**
   * Összes webshop listázása (publikus)
   * GET /webshop
   */
  @Get()
  async getAllWebshops() {
    try {
      return await this.webshopService.getAllWebshops();
    } catch (error) {
      throw new HttpException('Failed to fetch webshops', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Új webshop létrehozása (csak TEACHER és ADMIN)
   * POST /webshop
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async createWebshop(
    @Request() req,
    @Body() createWebshopDto: CreateWebshopDto
  ) {
    try {
      console.log('=== CREATE WEBSHOP REQUEST ===');
      console.log('Full req.user object:', req.user);
      console.log('req.user.sub:', req.user?.sub);
      console.log('req.user.userId:', req.user?.userId);
      console.log('req.user.user_id:', req.user?.user_id);
      console.log('req.user.id:', req.user?.id);

      // Próbáljuk megtalálni a user_id-t különböző mezőkből
      const teacherId = req.user?.sub || req.user?.userId || req.user?.user_id || req.user?.id;
      const userRole = req.user?.role;

      console.log('Extracted teacher ID:', teacherId);
      console.log('Teacher ID type:', typeof teacherId);
      console.log('User role:', userRole);
      console.log('Webshop data:', createWebshopDto);
      console.log('=============================');

      if (!teacherId) {
        throw new HttpException(
          'Teacher ID nem található a JWT token-ben! req.user: ' + JSON.stringify(req.user),
          HttpStatus.UNAUTHORIZED
        );
      }

      const result = await this.webshopService.createWebshop(teacherId, createWebshopDto);

      console.log('Webshop created successfully:', result.webshop_id);

      return result;
    } catch (error) {
      console.error('=== CREATE WEBSHOP ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('===========================');

      if (error.status === HttpStatus.BAD_REQUEST) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      if (error.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error.status === HttpStatus.FORBIDDEN) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      }

      throw new HttpException(
        error.message || 'Failed to create webshop',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Egy webshop lekérése (publikus)
   * GET /webshop/:id
   */
  @Get(':id')
  getWebshop(@Param('id', ParseIntPipe) id: number) {
    return this.webshopService.getWebshop(id);
  }

  /**
   * Webshop kategóriák lekérése (publikus)
   * GET /webshop/:id/categories
   */
  @Get(':id/categories')
  getCategories(@Param('id', ParseIntPipe) id: number) {
    return this.webshopService.getCategories(id);
  }

  /**
   * Webshop módosítása (csak TEACHER [saját] és ADMIN)
   * PUT /webshop/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async updateWebshop(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWebshopDto: UpdateWebshopDto
  ) {
    try {
      const userId = req.user.sub;
      const userRole = req.user.role;
      return await this.webshopService.updateWebshop(userId, userRole, id, updateWebshopDto);
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST || error.status === HttpStatus.FORBIDDEN) {
        throw new HttpException(error.message, error.status);
      }
      throw new HttpException('Failed to update webshop', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Webshop törlése (csak TEACHER [saját] és ADMIN)
   * DELETE /webshop/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async deleteWebshop(
    @Request() req,
    @Param('id', ParseIntPipe) id: number
  ) {
    try {
      const userId = req.user.sub;
      const userRole = req.user.role;
      return await this.webshopService.deleteWebshop(userId, userRole, id);
    } catch (error) {
      if (error.status === HttpStatus.FORBIDDEN) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      }
      throw new HttpException('Failed to delete webshop', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}