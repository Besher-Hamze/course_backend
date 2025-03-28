import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const CourseSchema = SchemaFactory.createForClass(Course);

