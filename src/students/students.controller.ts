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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetStudentId, GetUser } from 'src/common/decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { getUserId, isOwner, isStaff, isStudent } from 'src/common/utils/access.util';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /** Public registration for the student app. */
  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner, Role.Teacher)
  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-info')
  findMyInfo(@GetStudentId() studentId: string) {
    if (!studentId) {
      throw new ForbiddenException('غير مصرح');
    }
    return this.studentsService.findOne(studentId);
  }

  /** Alias used by the mobile app. */
  @UseGuards(JwtAuthGuard)
  @Get('my-infos')
  findMyInfos(@GetStudentId() studentId: string) {
    return this.findMyInfo(studentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('find/:id')
  findOne(@Param('id') id: string, @GetUser() user: any) {
    if (isStaff(user) || (isStudent(user) && getUserId(user) === id)) {
      return this.studentsService.findOne(id);
    }
    throw new ForbiddenException('غير مصرح');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @GetUser() user: any,
  ) {
    if (isOwner(user) || (isStudent(user) && getUserId(user) === id)) {
      return this.studentsService.update(id, updateStudentDto);
    }
    if (isStaff(user)) {
      // Teachers can update students (e.g. from dashboard) but not delete.
      return this.studentsService.update(id, updateStudentDto);
    }
    throw new ForbiddenException('غير مصرح');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
