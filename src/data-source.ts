import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

import { User } from './entity/user.entity';
import { Webshop } from './entity/webshop.entity';
import { WebshopPartner } from './entity/webshop-partner.entity';
import { Product } from './entity/product.entity';
import { UserBalance } from './entity/user-balance.entity';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { Purchase } from './entity/purchase.entity';
import { SignatureGenerationEvent } from './entity/signature-generation-event.entity';
import { SignatureCode } from './entity/signature-code.entity';
import { SignatureQR } from './entity/signature-qr.entity';
import { SignatureQRActivation } from './entity/signature-qr-activation.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [
    User,
    Webshop,
    WebshopPartner,
    Product,
    UserBalance,
    Cart,
    CartItem,
    Purchase,
    SignatureGenerationEvent,
    SignatureCode,
    SignatureQR,
    SignatureQRActivation,
  ],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: false,
});