// src/real-estate/real-estate.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { PropertiesController } from './controllers/properties.controller';
import { BookingsController } from './controllers/bookings.controller';
import { FavoritesController } from './controllers/favorites.controller';
import { UsersController } from './controllers/users.controller';
import { RealEstateService } from './services/real-estate.service';

@Module({
  controllers: [
    AuthController,
    PropertiesController,
    BookingsController,
    FavoritesController,
    UsersController,
  ],
  providers: [RealEstateService],
})
export class RealEstateModule {}