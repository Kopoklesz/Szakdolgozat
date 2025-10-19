import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // CORS beállítás - production és development környezet támogatása
  app.enableCors({
    origin: [
      'https://pannon-shop.hu',
      'https://api.pannon-shop.hu',
      'http://localhost:3000' // Development frontend
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3001);
  console.log(`🚀 Backend fut: http://localhost:3001`);
}
bootstrap();