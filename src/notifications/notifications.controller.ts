import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetUser } from 'src/common/decorator';
import { getStudentId } from 'src/common/utils/user.util';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /** Student app registers FCM token on open (existing login token is enough). */
  @UseGuards(JwtAuthGuard)
  @Post('register-token')
  registerToken(@Body() dto: RegisterTokenDto, @GetUser() user: any) {
    return this.notificationsService.registerToken(dto, getStudentId(user));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner, Role.Teacher)
  @Post('send')
  send(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendToTopic(dto);
  }
}
