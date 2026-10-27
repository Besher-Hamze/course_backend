import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppSettingsDocument = AppSettings & Document;

@Schema({ timestamps: true })
export class AppSettings {
  @Prop({ default: 'default', unique: true })
  key: string;

  /** Black overlay opacity on video controls (0 = transparent, 1 = fully black). */
  @Prop({ default: 0.4, min: 0, max: 1 })
  videoOverlayOpacity: number;
}

export const AppSettingsSchema = SchemaFactory.createForClass(AppSettings);
