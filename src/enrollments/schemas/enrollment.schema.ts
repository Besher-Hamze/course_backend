import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Student } from '../../students/schemas/student.schema';
import { Course } from '../../courses/schemas/course.schema';

export type EnrollmentDocument = Enrollment & Document;

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Student', required: true })
  student: Student;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: Course;

  @Prop({ default: Date.now })
  enrollDate: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

