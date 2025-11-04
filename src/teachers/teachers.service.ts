import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Teacher, TeacherDocument } from './schemas/teacher.schema';

@Injectable()
export class TeachersService {
    constructor(
        @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    ) { }

    async create(username: string, fullName: string, password: string): Promise<Teacher> {
        const exists = await this.teacherModel.findOne({ username }).exec();
        if (exists) throw new BadRequestException('Username already exists');
        const teacher = new this.teacherModel({ username, fullName, password, isActive: true });
        return teacher.save();
    }

    async findAll(): Promise<Teacher[]> {
        return this.teacherModel.find().exec();
    }

    async findByUsername(username: string): Promise<Teacher | null> {
        return this.teacherModel.findOne({ username }).exec();
    }

    async findById(id: string): Promise<Teacher> {
        const t = await this.teacherModel.findById(id).exec();
        if (!t) throw new NotFoundException('Teacher not found');
        return t;
    }

    async setActive(id: string, isActive: boolean): Promise<Teacher> {
        const t = await this.teacherModel.findByIdAndUpdate(id, { isActive }, { new: true }).exec();
        if (!t) throw new NotFoundException('Teacher not found');
        return t;
    }
}


