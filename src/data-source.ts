import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

import { User } from './entity/user.entity';
import { Webshop } from './entity/webshop.entity';
import { Product } from './entity/product.entity';
import { UserBalance } from './entity/user-balance.entity';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { Purchase } from './entity/purchase.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [User, Webshop, Product, UserBalance, Cart, CartItem, Purchase],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: false,
});
