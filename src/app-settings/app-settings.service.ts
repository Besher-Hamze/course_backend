import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppSettings, AppSettingsDocument } from './schemas/app-settings.schema';
import { UpdateAppSettingsDto } from './dto/update-app-settings.dto';

const SETTINGS_KEY = 'default';

@Injectable()
export class AppSettingsService {
  constructor(
    @InjectModel(AppSettings.name)
    private readonly settingsModel: Model<AppSettingsDocument>,
  ) {}

  async get() {
    let doc = await this.settingsModel.findOne({ key: SETTINGS_KEY }).exec();
    if (!doc) {
      doc = await this.settingsModel.create({
        key: SETTINGS_KEY,
        videoOverlayOpacity: 0.4,
      });
    }
    return {
      videoOverlayOpacity: doc.videoOverlayOpacity ?? 0.4,
    };
  }

  async update(dto: UpdateAppSettingsDto) {
    const doc = await this.settingsModel.findOneAndUpdate(
      { key: SETTINGS_KEY },
      {
        $set: {
          ...(dto.videoOverlayOpacity !== undefined
            ? { videoOverlayOpacity: dto.videoOverlayOpacity }
            : {}),
        },
        $setOnInsert: { key: SETTINGS_KEY },
      },
      { upsert: true, new: true },
    );

    return {
      videoOverlayOpacity: doc.videoOverlayOpacity ?? 0.4,
    };
  }
}
