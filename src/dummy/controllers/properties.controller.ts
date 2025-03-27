// src/real-estate/controllers/properties.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { RealEstateService } from '../services/real-estate.service';

@Controller('api/properties')
export class PropertiesController {
  constructor(private readonly realEstateService: RealEstateService) {}

  @Get()
  getAllProperties(@Query() query: any) {
    return this.realEstateService.getAllProperties(query);
  }

  @Get('search')
  searchProperties(
    @Query('query') searchQuery: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.realEstateService.searchProperties(searchQuery, page, pageSize);
  }

  @Get(':id')
  getPropertyById(@Param('id') id: string) {
    const property = this.realEstateService.getPropertyById(id);
    if (!property) {
      return { statusCode: 404, message: 'العقار غير موجود' };
    }
    return property;
  }
}