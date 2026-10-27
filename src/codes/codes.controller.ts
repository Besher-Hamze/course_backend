import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { CodesService } from './codes.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetUser } from 'src/common/decorator';
import { CourseAccessService } from 'src/common/services/course-access.service';

@Controller('codes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CodesController {
  constructor(
    private readonly codesService: CodesService,
    private readonly courseAccess: CourseAccessService,
  ) {}

  @Post('courses/:courseId/generate')
  @Roles(Role.Owner, Role.Teacher)
  async generateCodes(
    @Param('courseId') courseId: string,
    @Body() body: { count?: number },
    @GetUser() user: any,
  ) {
    await this.courseAccess.assertCanManageCourse(user, courseId);
    const count = body.count || 100;
    const codes = await this.codesService.generateForCourse(courseId, count);
    return { codes, count: codes.length };
  }

  @Get('courses/:courseId/active')
  @Roles(Role.Owner, Role.Teacher)
  async getActiveCodes(@Param('courseId') courseId: string, @GetUser() user: any) {
    await this.courseAccess.assertCanManageCourse(user, courseId);
    return this.codesService.getActiveCodesForCourse(courseId);
  }

  @Get('courses/:courseId/used')
  @Roles(Role.Owner, Role.Teacher)
  async getUsedCodes(@Param('courseId') courseId: string, @GetUser() user: any) {
    await this.courseAccess.assertCanManageCourse(user, courseId);
    return this.codesService.getUsedCodesForCourse(courseId);
  }
}
