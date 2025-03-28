import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Course } from '../../courses/schemas/course.schema';

export type VideoDocument = Video & Document;

@Schema({ timestamps: true })
export class Video {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: Course;

  @Prop()
  duration: number;

  @Prop()
  order: number;
}

export const VideoSchema = SchemaFactory.createForClass(Video);

