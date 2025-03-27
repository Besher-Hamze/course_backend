// src/real-estate/controllers/users.controller.ts
import { Body, Controller, Get, Put, Headers } from '@nestjs/common';
import { RealEstateService } from '../services/real-estate.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly realEstateService: RealEstateService) {}

  @Get('profile')
  getUserProfile(@Headers('Authorization') auth: string) {
    const userId = 'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454'; // Extract from token in real app
    return this.realEstateService.getUserProfile(userId);
  }

  @Put('profile')
  updateProfile(@Body() data: any, @Headers('Authorization') auth: string) {
    const userId = 'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454'; // Extract from token in real app
    return this.realEstateService.updateUserProfile(userId, data);
  }

  @Put('change-password')
  changePassword(@Body() data: any, @Headers('Authorization') auth: string) {
    const userId = 'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454'; // Extract from token in real app
    return this.realEstateService.changePassword(userId, data);
  }
}