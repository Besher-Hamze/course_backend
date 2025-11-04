import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Code, CodeDocument } from './schemas/code.schema';

@Injectable()
export class CodesService {
    constructor(
        @InjectModel(Code.name) private codeModel: Model<CodeDocument>,
    ) { }

    async generateForCourse(courseId: string, count: number = 100): Promise<string[]> {
        const codes: string[] = [];
        const docs: Partial<Code>[] = [];
        for (let i = 0; i < count; i++) {
            const code = this.generateCode();
            codes.push(code);
            docs.push({ code, course: new Types.ObjectId(courseId) } as any);
        }
        await this.codeModel.insertMany(docs);
        return codes;
    }

    private generateCode(): string {
        return (
            Math.random().toString(36).slice(2, 6) +
            Math.random().toString(36).slice(2, 6) +
            Math.random().toString(36).slice(2, 4)
        ).toUpperCase();
    }

    async redeem(codeValue: string, studentId: string): Promise<Code> {
        const code = await this.codeModel.findOne({ code: codeValue }).exec();
        if (!code) throw new NotFoundException('Code not found');
        if (code.usedBy) throw new BadRequestException('Code already used');
        code.usedBy = new Types.ObjectId(studentId) as any;
        code.usedAt = new Date();
        return code.save();
    }

    async countUsedByCourse(courseId: string): Promise<number> {
        return this.codeModel.countDocuments({ course: courseId, usedBy: { $ne: null } }).exec();
    }

    async getActiveCodesForCourse(courseId: string): Promise<Code[]> {
        return this.codeModel.find({ course: courseId, usedBy: null }).exec();
    }

    async getUsedCodesForCourse(courseId: string): Promise<Code[]> {
        return this.codeModel.find({ course: courseId, usedBy: { $ne: null } })
            .populate('usedBy', 'fullName universityId')
            .exec();
    }
}


