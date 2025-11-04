import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeacherDocument = Teacher & Document;

@Schema({ timestamps: true })
export class Teacher {
    _id: Types.ObjectId;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isOwner: boolean;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);


