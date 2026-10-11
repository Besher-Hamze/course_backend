import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdDocument = Ad & Document;

@Schema({ timestamps: true })
export class Ad {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  whatsappNumber: string;

  @Prop()
  whatsappMessage?: string;
}

export const AdSchema = SchemaFactory.createForClass(Ad);
