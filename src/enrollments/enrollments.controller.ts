import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { BulkEnrollmentDto } from './dto/bulk-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetStudentId, GetUser } from 'src/common/decorator';
import { CodesService } from 'src/codes/codes.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CourseAccessService } from 'src/common/services/course-access.service';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly codesService: CodesService,
    private readonly courseAccess: CourseAccessService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner, Role.Teacher)
  @Post()
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto, @GetUser() user: any) {
    await this.courseAccess.assertCanManageCourse(user, createEnrollmentDto.course);
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner, Role.Teacher)
  @Post('bulk')
  async createBulk(@Body() bulkEnrollmentDto: BulkEnrollmentDto, @GetUser() user: any) {
    await this.courseAccess.assertCanManageCourses(user, bulkEnrollmentDto.courses);
    return this.enrollmentsService.createBulk(bulkEnrollmentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('redeem')
  async redeem(@Body() body: { code: string }, @GetStudentId() studentId: string) {
    if (!studentId) {
      throw new ForbiddenException('فقط الطالب يمكنه تفعيل الكود');
    }
    const redeemed = await this.codesService.redeem(body.code, studentId);
    return this.enrollmentsService.create({
      student: studentId,
      course: (redeemed.course as any).toString(),
    } as any);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner, Role.Teacher)
  @Get()
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-student')
  findAllByStudent(@GetStudentId() studentId: string, @GetUser() user: any) {
    if (!studentId) {
      throw new ForbiddenException('غير مصرح');
    }
    return this.enrollmentsService.findAllByStudent(studentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner, Role.Teacher)
  @Get('by-course/:courseId')
  async findAllByCourse(@Param('courseId') courseId: string, @GetUser() user: any) {
    await this.courseAccess.assertCanManageCourse(user, courseId);
    return this.enrollmentsService.findAllByCourse(courseId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner, Role.Teacher)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner, Role.Teacher)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
    @GetUser() user: any,
  ) {
    const enrollment = await this.enrollmentsService.findOne(id);
    const courseId = ((enrollment as any).course?._id ?? (enrollment as any).course).toString();
    await this.courseAccess.assertCanManageCourse(user, courseId);
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner, Role.Teacher)
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: any) {
    const enrollment = await this.enrollmentsService.findOne(id);
    const courseId = ((enrollment as any).course?._id ?? (enrollment as any).course).toString();
    await this.courseAccess.assertCanManageCourse(user, courseId);
    return this.enrollmentsService.remove(id);
  }
}
