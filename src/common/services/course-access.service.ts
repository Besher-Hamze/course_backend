import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from 'src/courses/schemas/course.schema';
import { Role } from '../enums/role.enum';
import { getUserId, isOwner } from '../utils/access.util';

@Injectable()
export class CourseAccessService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
  ) {}

  async assertCanManageCourse(user: any, courseId: string): Promise<CourseDocument> {
    if (!user) {
      throw new ForbiddenException('غير مصرح');
    }

    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`الكورس برقم المعرف ${courseId} غير موجود`);
    }

    if (isOwner(user)) {
      return course;
    }

    if (user.role !== Role.Teacher) {
      throw new ForbiddenException('غير مصرح لهذه العملية');
    }

    const teacherId = getUserId(user);
    const courseTeacherId =
      (course.teacher as any)?._id?.toString?.() ??
      (course.teacher as any)?.toString?.();

    if (!teacherId || !courseTeacherId || courseTeacherId !== teacherId) {
      throw new ForbiddenException('ليس لديك صلاحية على هذا الكورس');
    }

    return course;
  }

  async assertCanManageCourses(user: any, courseIds: string[]): Promise<void> {
    const unique = [...new Set(courseIds.filter(Boolean))];
    if (!unique.length) {
      throw new ForbiddenException('يجب تحديد كورس واحد على الأقل');
    }
    for (const id of unique) {
      await this.assertCanManageCourse(user, id);
    }
  }
}
