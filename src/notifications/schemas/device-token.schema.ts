import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeviceTokenDocument = DeviceToken & Document;

@Schema({ timestamps: true })
export class DeviceToken {
  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'Student', required: false })
  student?: Types.ObjectId;

  @Prop({ required: false })
  platform?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'all_students' })
  topic: string;
}

export const DeviceTokenSchema = SchemaFactory.createForClass(DeviceToken);
