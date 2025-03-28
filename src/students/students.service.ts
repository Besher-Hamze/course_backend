import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from './schemas/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const hashedPassword = await bcrypt.hash(createStudentDto.password, 10);
    const newStudent = new this.studentModel({
      ...createStudentDto,
      password: hashedPassword,
    });
    return newStudent.save();
  }

  async findAll(): Promise<Student[]> {
    return this.studentModel.find().exec();
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`الطالب برقم المعرف ${id} غير موجود`);
    }
    return student;
  }

  async findByUniversityId(universityId: string): Promise<StudentDocument> {
    return this.studentModel.findOne({ universityId }).exec();
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    if (updateStudentDto.password) {
      updateStudentDto.password = await bcrypt.hash(updateStudentDto.password, 10);
    }
    
    const updatedStudent = await this.studentModel
      .findByIdAndUpdate(id, updateStudentDto, { new: true })
      .exec();
      
    if (!updatedStudent) {
      throw new NotFoundException(`الطالب برقم المعرف ${id} غير موجود`);
    }
    return updatedStudent;
  }

  async remove(id: string): Promise<Student> {
    const deletedStudent = await this.studentModel.findByIdAndDelete(id).exec();
    if (!deletedStudent) {
      throw new NotFoundException(`الطالب برقم المعرف ${id} غير موجود`);
    }
    return deletedStudent;
  }
}