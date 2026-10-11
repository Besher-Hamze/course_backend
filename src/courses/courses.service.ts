import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { extname } from 'path';
import * as crypto from 'crypto';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Enrollment } from '../enrollments/schemas/enrollment.schema';
import { StorageService } from 'src/storage/storage.service';
import { toPlain } from 'src/common/utils/user.util';

const teacherPopulate = { path: 'teacher' as const, select: 'fullName username' };

/** S3 presigned URLs are capped at 7 days. */
const COVER_URL_TTL_SECONDS = 6 * 24 * 60 * 60;

export type CoverSize = 'small' | 'large';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel('Enrollment') private enrollmentModel: Model<Enrollment>,
    private readonly storage: StorageService,
  ) {}

  private async withCoverUrls<T = any>(course: any): Promise<T> {
    const plain = toPlain(course);
    const [coverSmallUrl, coverLargeUrl] = await Promise.all([
      plain.coverSmall ? this.storage.getSignedUrl(plain.coverSmall, COVER_URL_TTL_SECONDS) : null,
      plain.coverLarge ? this.storage.getSignedUrl(plain.coverLarge, COVER_URL_TTL_SECONDS) : null,
    ]);
    return { ...plain, coverSmallUrl, coverLargeUrl };
  }

  private withCoverUrlsMany(courses: any[]) {
    return Promise.all(courses.map((course) => this.withCoverUrls(course)));
  }

  async create(createCourseDto: CreateCourseDto & { teacher: string }): Promise<Course> {
    const newCourse = new this.courseModel({
      ...createCourseDto,
      teacher: new Types.ObjectId(createCourseDto.teacher),
    });
    const saved = await newCourse.save();
    return this.withCoverUrls(await saved.populate(teacherPopulate));
  }

  async findAll(): Promise<Course[]> {
    const courses = await this.courseModel.find().populate(teacherPopulate).exec();
    return this.withCoverUrlsMany(courses);
  }

  async findAllByYearAndSemester(year: number, semester: number, major: string): Promise<Course[]> {
    const courses = await this.courseModel
      .find({ yearLevel: year, semester: semester, major })
      .populate(teacherPopulate)
      .exec();
    return this.withCoverUrlsMany(courses);
  }

  private async findDocument(id: string): Promise<CourseDocument> {
    const course = await this.courseModel.findById(id).populate(teacherPopulate).exec();
    if (!course) {
      throw new NotFoundException(`الكورس برقم المعرف ${id} غير موجود`);
    }
    return course;
  }

  async findOne(id: string): Promise<Course> {
    return this.withCoverUrls(await this.findDocument(id));
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .populate(teacherPopulate)
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException(`الكورس برقم المعرف ${id} غير موجود`);
    }
    return this.withCoverUrls(updatedCourse);
  }

  async updateCovers(id: string, files: Partial<Record<CoverSize, Express.Multer.File>>): Promise<Course> {
    const course = await this.findDocument(id);

    for (const size of ['small', 'large'] as CoverSize[]) {
      const file = files[size];
      if (!file) continue;

      const field = size === 'small' ? 'coverSmall' : 'coverLarge';
      const key = `courses/covers/${id}-${size}-${crypto.randomBytes(8).toString('hex')}${extname(file.originalname).toLowerCase()}`;
      await this.storage.upload(key, file.buffer, file.mimetype);

      const previousKey = course[field];
      course[field] = key;
      if (previousKey) {
        await this.storage.delete(previousKey);
      }
    }

    await course.save();
    return this.withCoverUrls(course);
  }

  async removeCover(id: string, size: CoverSize): Promise<Course> {
    const course = await this.findDocument(id);
    const field = size === 'small' ? 'coverSmall' : 'coverLarge';
    if (course[field]) {
      await this.storage.delete(course[field]);
      course[field] = undefined;
      await course.save();
    }
    return this.withCoverUrls(course);
  }

  async remove(id: string): Promise<Course> {
    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();
    if (!deletedCourse) {
      throw new NotFoundException(`الكورس برقم المعرف ${id} غير موجود`);
    }
    await Promise.all(
      [deletedCourse.coverSmall, deletedCourse.coverLarge].filter(Boolean).map((key) => this.storage.delete(key)),
    );
    return deletedCourse;
  }

  async getCoursesWithAvailability(
    studentId: string,
    options?: {
      year?: number;
      semester?: number;
      major?: string;
    },
  ): Promise<(Course & { isAvailable: boolean })[]> {
    const courseQuery: Record<string, unknown> = {};
    if (options?.year) courseQuery.yearLevel = options.year;
    if (options?.semester) courseQuery.semester = options.semester;
    if (options?.major) courseQuery.major = options.major;

    const courses = await this.courseModel
      .find(courseQuery)
      .populate(teacherPopulate)
      .sort({ createdAt: -1 })
      .exec();

    const studentEnrollments = await this.enrollmentModel
      .find({
        student: new Types.ObjectId(studentId),
        isActive: true,
      })
      .select('course')
      .lean()
      .exec();

    const enrolledCourseIds = new Set(studentEnrollments.map((enrollment) => enrollment.course.toString()));

    const withCovers = await this.withCoverUrlsMany(courses);
    return withCovers.map((course) => ({
      ...course,
      isAvailable: enrolledCourseIds.has(course._id.toString()),
    }));
  }

  async findMineWithEnrollmentCounts(
    teacherId: string,
    isOwner: boolean = false,
  ): Promise<(Course & { enrollments: number })[]> {
    const filter = !isOwner ? { teacher: teacherId } : {};
    const courses = await this.courseModel.find(filter).populate(teacherPopulate).exec();
    return Promise.all(
      courses.map(async (course) => ({
        ...(await this.withCoverUrls(course)),
        enrollments: await this.enrollmentModel.countDocuments({ course: course._id }).exec(),
      })),
    );
  }
}
