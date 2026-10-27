import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  ParseEnumPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CoursesService, CoverSize } from './courses.service';
import { imageUploadOptions } from 'src/common/utils/image-upload';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetStudentId, GetUser } from 'src/common/decorator';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CourseAccessService } from 'src/common/services/course-access.service';
import { getUserId } from 'src/common/utils/access.util';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly courseAccess: CourseAccessService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(Role.Teacher, Role.Owner)
  create(@Body() createCourseDto: CreateCourseDto, @GetUser() user: any) {
    const teacherId = getUserId(user);
    return this.coursesService.create({ ...createCourseDto, teacher: teacherId });
  }

  @Get('with-availability')
  @UseGuards(JwtAuthGuard)
  async getCoursesWithAvailability(
    @GetStudentId() studentId: string,
    @Query('year') year?: number,
    @Query('semester') semester?: number,
    @Query('major') major?: string,
  ) {
    return this.coursesService.getCoursesWithAvailability(studentId, {
      year,
      semester,
      major,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('mine/with-counts')
  @Roles(Role.Teacher, Role.Owner)
  async getMineWithCounts(@GetUser() user: any) {
    const teacherId = getUserId(user);
    const isOwner = user?.role === Role.Owner;
    return this.coursesService.findMineWithEnrollmentCounts(teacherId, isOwner);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-year-semester')
  findAllByYearAndSemester(
    @Query('year') year: number,
    @Query('semester') semester: number,
    @Query('major') major: string,
  ) {
    return this.coursesService.findAllByYearAndSemester(+year, +semester, major);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @GetUser() user: any,
  ) {
    await this.courseAccess.assertCanManageCourse(user, id);
    return this.coursesService.update(id, updateCourseDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Post(':id/covers')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'coverSmall', maxCount: 1 },
        { name: 'coverLarge', maxCount: 1 },
      ],
      imageUploadOptions,
    ),
  )
  async uploadCovers(
    @Param('id') id: string,
    @UploadedFiles()
    files: { coverSmall?: Express.Multer.File[]; coverLarge?: Express.Multer.File[] },
    @GetUser() user: any,
  ) {
    await this.courseAccess.assertCanManageCourse(user, id);
    if (!files?.coverSmall?.length && !files?.coverLarge?.length) {
      throw new BadRequestException('يرجى رفع صورة الغلاف الصغيرة أو الكبيرة');
    }
    return this.coursesService.updateCovers(id, {
      small: files.coverSmall?.[0],
      large: files.coverLarge?.[0],
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Delete(':id/covers/:size')
  async removeCover(
    @Param('id') id: string,
    @Param('size', new ParseEnumPipe(['small', 'large'])) size: CoverSize,
    @GetUser() user: any,
  ) {
    await this.courseAccess.assertCanManageCourse(user, id);
    return this.coursesService.removeCover(id, size);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: any) {
    await this.courseAccess.assertCanManageCourse(user, id);
    return this.coursesService.remove(id);
  }
}
