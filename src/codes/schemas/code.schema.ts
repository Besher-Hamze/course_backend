import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Course } from 'src/courses/schemas/course.schema';
import { Student } from 'src/students/schemas/student.schema';

export type CodeDocument = Code & Document;

@Schema({ timestamps: true })
export class Code {
    @Prop({ required: true, unique: true })
    code: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
    course: Course;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Student', default: null })
    usedBy: Student | null;

    @Prop({ default: null })
    usedAt: Date | null;
}

export const CodeSchema = SchemaFactory.createForClass(Code);


