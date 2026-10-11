import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Teacher } from 'src/teachers/schemas/teacher.schema';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  major: string;

  @Prop({ required: true })
  yearLevel: number;

  @Prop({ required: true, enum: [1, 2] })
  semester: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Teacher', required: true })
  teacher: Teacher;

  @Prop()
  coverSmall?: string;

  @Prop()
  coverLarge?: string;

  teacherName?: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.virtual('teacherName').get(function () {
  const t = this.teacher as Teacher | undefined;
  if (t && typeof t === 'object' && 'fullName' in t) {
    return t.fullName;
  }
  return undefined;
});

CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });
