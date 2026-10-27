import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import * as crypto from 'crypto';
import { StorageService } from 'src/storage/storage.service';
import { memoryStorage } from 'multer';
import { EnrollmentsService } from 'src/enrollments/enrollments.service';
import { GetUser } from 'src/common/decorator';
import { getStudentId, toPlain } from 'src/common/utils/user.util';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CourseAccessService } from 'src/common/services/course-access.service';
import { isStaff } from 'src/common/utils/access.util';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly storage: StorageService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly courseAccess: CourseAccessService,
  ) {}

  private async assertCanManageFile(user: any, fileId: string) {
    const file = await this.filesService.findOne(fileId);
    const courseId = ((file as any).course?._id ?? (file as any).course).toString();
    await this.courseAccess.assertCanManageCourse(user, courseId);
    return file;
  }

  private async assertCanDownload(user: any, file: any) {
    if (isStaff(user)) return;
    const studentId = getStudentId(user);
    if (!studentId) {
      throw new ForbiddenException('غير مصرح');
    }
    const courseId = ((file.course as any)?._id ?? file.course).toString();
    if (!(await this.enrollmentsService.hasActiveEnrollment(studentId, courseId))) {
      throw new ForbiddenException('هذا الملف مقفل، يرجى تفعيل الكورس أولاً');
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFileDto: CreateFileDto,
    @GetUser() user: any,
  ) {
    await this.courseAccess.assertCanManageCourse(user, createFileDto.course);
    const randomName = crypto.randomBytes(16).toString('hex');
    const extension = extname(file.originalname).toLowerCase();
    const objectKey = `files/${randomName}${extension}`;
    await this.storage.upload(objectKey, file.buffer, file.mimetype);
    return this.filesService.create({
      ...createFileDto,
      filePath: objectKey,
      fileType: extension.substring(1),
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-course/:courseId')
  async findAllByCourse(@Param('courseId') courseId: string, @GetUser() user: any) {
    const files = await this.filesService.findAllByCourse(courseId);
    const studentId = getStudentId(user);
    const isEnrolled = studentId
      ? await this.enrollmentsService.hasActiveEnrollment(studentId, courseId)
      : isStaff(user);
    return files.map((file) => ({ ...toPlain(file), isLocked: !isEnrolled }));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/url')
  async getSignedUrl(@Param('id') id: string, @GetUser() user: any) {
    const file = await this.filesService.findOne(id);
    await this.assertCanDownload(user, file);
    const url = await this.storage.getSignedUrl(file.filePath);
    return { url };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: any) {
    const file = await this.filesService.findOne(id);
    await this.assertCanDownload(user, file);
    return file;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
    @GetUser() user: any,
  ) {
    await this.assertCanManageFile(user, id);
    if (updateFileDto.course) {
      await this.courseAccess.assertCanManageCourse(user, updateFileDto.course);
    }
    return this.filesService.update(id, updateFileDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: any) {
    await this.assertCanManageFile(user, id);
    return this.filesService.remove(id);
  }
}
