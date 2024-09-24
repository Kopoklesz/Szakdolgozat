import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',  // A helyi gépen futtatjuk
      port: 5432,  // PostgreSQL alapértelmezett portja
      username: 'postgres',  // A PostgreSQL-ben megadott felhasználónév
      password: '5060',  // A PostgreSQL-ben megadott jelszó
      database: 'main',  // Az előbb létrehozott adatbázis neve
      entities: [__dirname + '/**/*.entity{.ts,.js}'],  // Entity-k automatikus beolvasása
      synchronize: true,  // Automatikusan szinkronizálja a séma változásait (fejlesztésre alkalmas, éles környezetben állítsd false-ra)
    }),
  ],
})
export class DatabaseModule {}