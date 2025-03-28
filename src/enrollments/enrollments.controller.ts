// src/enrollments/enrollments.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetStudentId } from 'src/common/decorator';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-student')
  findAllByStudent(@GetStudentId() studentId: string) {
    return this.enrollmentsService.findAllByStudent(studentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-course/:courseId')
  findAllByCourse(@Param('courseId') courseId: string) {
    return this.enrollmentsService.findAllByCourse(courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEnrollmentDto: UpdateEnrollmentDto) {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enrollmentsService.remove(id);
  }
}

