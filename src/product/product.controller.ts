import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete,
  Body, 
  Param, 
  ParseIntPipe, 
  UseFilters, 
  UseGuards,
  Request,
  HttpException, 
  HttpStatus, 
  BadRequestException, 
  NotFoundException 
} from '@nestjs/common';
import { ProductService } from './product.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entity/user.entity';

@Controller('product')
@UseFilters(new HttpExceptionFilter())
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Termék létrehozása (csak TEACHER [saját webshop] és ADMIN)
   * POST /product
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async createProduct(
    @Request() req,
    @Body() createProductDto: CreateProductDto
  ) {
    console.log('Received create product request:', createProductDto);
    try {
      const userId = req.user.sub;
      const userRole = req.user.role;
      const result = await this.productService.createProduct(userId, userRole, createProductDto);
      console.log('Product created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error in createProduct:', error);
      if (error instanceof BadRequestException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error.status === HttpStatus.FORBIDDEN) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      } else {
        throw new HttpException(
          'There was a problem creating the product: ' + error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Termék módosítása (csak TEACHER [saját webshop] és ADMIN)
   * PUT /product/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async updateProduct(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ) {
    try {
      const userId = req.user.sub;
      const userRole = req.user.role;
      return await this.productService.updateProduct(userId, userRole, id, updateProductDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error.status === HttpStatus.FORBIDDEN) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      } else {
        throw new HttpException(
          'Failed to update product: ' + error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Termék törlése (csak TEACHER [saját webshop] és ADMIN)
   * DELETE /product/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async deleteProduct(
    @Request() req,
    @Param('id', ParseIntPipe) id: number
  ) {
    try {
      const userId = req.user.sub;
      const userRole = req.user.role;
      return await this.productService.deleteProduct(userId, userRole, id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error.status === HttpStatus.FORBIDDEN) {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      } else {
        throw new HttpException(
          'Failed to delete product: ' + error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Egy termék lekérése (publikus)
   * GET /product/:id
   */
  @Get(':id')
  getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProduct(id);
  }

  /**
   * Webshop összes termékének lekérése (publikus)
   * GET /product/webshop/:id
   */
  @Get('webshop/:id')
  getProductsByWebshop(@Param('id', ParseIntPipe) webshopId: number) {
    return this.productService.getProductsByWebshop(webshopId);
  }
}