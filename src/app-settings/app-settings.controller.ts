import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AppSettingsService } from './app-settings.service';
import { UpdateAppSettingsDto } from './dto/update-app-settings.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('app-settings')
export class AppSettingsController {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  get() {
    return this.appSettingsService.get();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner)
  @Patch()
  update(@Body() dto: UpdateAppSettingsDto) {
    return this.appSettingsService.update(dto);
  }
}
