import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { universityId: string; password: string, deviceNumber: string}) {
    const { universityId, password,deviceNumber } = loginDto;
    return this.authService.login(universityId, password,deviceNumber);
  }
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() adminLoginDto: { username: string; password: string }) {
    const { username, password } = adminLoginDto;
    
    if (username === 'admin' && password === 'admin') {
      return this.authService.generateAdminToken();
    }
    
    throw new UnauthorizedException("Invalid username or password");
  }
}