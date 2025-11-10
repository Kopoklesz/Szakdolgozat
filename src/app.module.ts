import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WebshopModule } from './webshop/webshop.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { PurchaseModule } from './purchase/purchase.module';
import { SignatureModule } from './signature/signature.module';
import { DatabaseModule } from './database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    WebshopModule,
    UserModule,
    ProductModule,
    CartModule,
    PurchaseModule,
    SignatureModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }