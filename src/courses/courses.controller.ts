import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetStudentId } from 'src/common/decorator';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get('with-availability')
  @UseGuards(JwtAuthGuard)
  async getCoursesWithAvailability(
    @GetStudentId() studentId: string,
    @Query('year') year?: number,
    @Query('semester') semester?: number,
    @Query('major') major?: string
  ) {
    return this.coursesService.getCoursesWithAvailability(studentId, {
      year,
      semester,
      major
    });
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
    @Query('major') major: string
  ) {
    return this.coursesService.findAllByYearAndSemester(+year, +semester, major);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}

