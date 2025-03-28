import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Enrollment } from '../enrollments/schemas/enrollment.schema'; // Adjust import path as needed

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel('Enrollment') private enrollmentModel: Model<Enrollment>, // Add Enrollment model
  ) { }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const newCourse = new this.courseModel(createCourseDto);
    return newCourse.save();
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }

  async findAllByYearAndSemester(year: number, semester: number, major: string): Promise<Course[]> {
    const courses = this.courseModel
      .find({ yearLevel: year, semester: semester, major })
      .exec();

    return courses;
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException(`الكورس برقم المعرف ${id} غير موجود`);
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException(`الكورس برقم المعرف ${id} غير موجود`);
    }
    return updatedCourse;
  }

  async remove(id: string): Promise<Course> {
    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();
    if (!deletedCourse) {
      throw new NotFoundException(`الكورس برقم المعرف ${id} غير موجود`);
    }
    return deletedCourse;
  }

  async getCoursesWithAvailability(studentId: string, options?: {
    year?: number;
    semester?: number;
    major?: string;
  }): Promise<(Course & { isAvailable: boolean })[]> {
    const courseQuery: any = {};
    if (options?.year) courseQuery.yearLevel = options.year;
    if (options?.semester) courseQuery.semester = options.semester;
    if (options?.major) courseQuery.major = options.major;

    const courses = await this.courseModel.find(courseQuery).exec();

    console.log(studentId);

    const studentEnrollments = await this.enrollmentModel
      .find({
        student: new Types.ObjectId(studentId),
        isActive: true 
      })
      .populate('course')
      .exec();

    const enrolledCourseIds = new Set(
      studentEnrollments.map(enrollment =>
        (enrollment.course as any)._id.toString()
      )
    );
    console.log(enrolledCourseIds);

    return courses.map(course => ({
      ...course.toObject(),
      isAvailable: enrolledCourseIds.has(course._id.toString())
    }));
  }
}