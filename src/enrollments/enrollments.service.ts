// src/enrollments/enrollments.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Course, CourseDocument } from 'src/courses/schemas/course.schema';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) { }



  async getCoursesWithAvailability(studentId: string): Promise<any[]> {
    const allCourses = await this.courseModel.find().exec();

    const studentEnrollments = await this.enrollmentModel
      .find({ student: new Types.ObjectId(studentId) })
      .populate('course')
      .exec();

    const enrolledCourseIds = new Set(
      studentEnrollments.map(enrollment => (enrollment.course as any)._id.toString())
    );

    return allCourses.map(course => ({
      ...course.toObject(), // Convert to plain object
      isAvailable: enrolledCourseIds.has(course._id.toString())
    }));
  }

  async getAvailableCourses(studentId: string): Promise<any[]> {
    const coursesWithAvailability = await this.getCoursesWithAvailability(studentId);
    return coursesWithAvailability.filter(course => course.isAvailable);
  }
  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const existingEnrollment = await this.enrollmentModel.findOne({
      student: createEnrollmentDto.student,
      course: createEnrollmentDto.course,
    }).exec();

    if (existingEnrollment) {
      throw new BadRequestException('الطالب مسجل بالفعل في هذا الكورس');
    }

    const newEnrollment = new this.enrollmentModel(createEnrollmentDto);
    return newEnrollment.save();
  }

  async findAll(): Promise<Enrollment[]> {
    return this.enrollmentModel.find()
      .populate('student')
      .populate('course')
      .exec();
  }

  async findAllByStudent(studentId: string): Promise<Enrollment[]> {
    return this.enrollmentModel
      .find({ student: studentId })
      .populate('course')
      .exec();
  }

  async findAllByCourse(courseId: string): Promise<Enrollment[]> {
    return this.enrollmentModel
      .find({ course: courseId })
      .populate('student')
      .exec();
  }

  async findOne(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentModel.findById(id)
      .populate('student')
      .populate('course')
      .exec();
    if (!enrollment) {
      throw new NotFoundException(`التسجيل برقم المعرف ${id} غير موجود`);
    }
    return enrollment;
  }

  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto): Promise<Enrollment> {
    const updatedEnrollment = await this.enrollmentModel
      .findByIdAndUpdate(id, updateEnrollmentDto, { new: true })
      .exec();

    if (!updatedEnrollment) {
      throw new NotFoundException(`التسجيل برقم المعرف ${id} غير موجود`);
    }
    return updatedEnrollment;
  }

  async remove(id: string): Promise<Enrollment> {
    const deletedEnrollment = await this.enrollmentModel.findByIdAndDelete(id).exec();
    if (!deletedEnrollment) {
      throw new NotFoundException(`التسجيل برقم المعرف ${id} غير موجود`);
    }
    return deletedEnrollment;
  }
}
