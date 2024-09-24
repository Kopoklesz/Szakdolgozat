import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Add global validation pipe
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
}
bootstrap();