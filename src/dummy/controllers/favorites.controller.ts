// src/real-estate/controllers/favorites.controller.ts
import { Controller, Delete, Get, Param, Post, Query, Headers } from '@nestjs/common';
import { RealEstateService } from '../services/real-estate.service';

@Controller('api/favorites')
export class FavoritesController {
  constructor(private readonly realEstateService: RealEstateService) {}

  @Get()
  getFavorites(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Headers('Authorization') auth: string,
  ) {
    const userId = 'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454'; // Extract from token in real app
    return this.realEstateService.getUserFavorites(userId, page, pageSize);
  }

  @Post(':propertyId')
  addToFavorites(@Param('propertyId') propertyId: string, @Headers('Authorization') auth: string) {
    const userId = 'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454'; // Extract from token in real app
    return this.realEstateService.addToFavorites(userId, propertyId);
  }

  @Delete(':propertyId')
  removeFromFavorites(@Param('propertyId') propertyId: string, @Headers('Authorization') auth: string) {
    const userId = 'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454'; // Extract from token in real app
    return this.realEstateService.removeFromFavorites(userId, propertyId);
  }
}