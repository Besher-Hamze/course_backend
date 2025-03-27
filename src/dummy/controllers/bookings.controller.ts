// src/real-estate/controllers/bookings.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Query, Headers } from '@nestjs/common';
import { RealEstateService } from '../services/real-estate.service';

@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly realEstateService: RealEstateService) {}

  @Post()
  createBooking(@Body() bookingData: any, @Headers('Authorization') auth: string) {
    const userId = 'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454'; // Extract from token in real app
    return this.realEstateService.createBooking({
      ...bookingData,
      userId,
    });
  }

  @Get('user')
  getUserBookings(
    @Query('status') status: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Headers('Authorization') auth: string,
  ) {
    const userId = 'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454'; // Extract from token in real app
    return this.realEstateService.getUserBookings(userId, status, page, pageSize);
  }

  @Delete(':id')
  cancelBooking(@Param('id') id: string) {
    return this.realEstateService.cancelBooking(id);
  }
}