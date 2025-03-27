// src/real-estate/controllers/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { RealEstateService } from '../services/real-estate.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly realEstateService: RealEstateService) {}

  @Post('login')
  login(@Body() loginData: any) {
    const result = this.realEstateService.login(loginData);
    if (!result) {
      return { 
        statusCode: 401, 
        message: 'بيانات الاعتماد غير صحيحة' 
      };
    }
    return result;
  }

  @Post('register')
  register(@Body() registerData: any) {
    return this.realEstateService.register(registerData);
  }

  @Post('refresh-token')
  refreshToken(@Body() data: any) {
    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }
}