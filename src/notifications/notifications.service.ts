import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from 'firebase-admin/messaging';
import { DeviceToken, DeviceTokenDocument } from './schemas/device-token.schema';
import { RegisterTokenDto } from './dto/register-token.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { FirebaseService } from './firebase.service';

export const ALL_STUDENTS_TOPIC = 'all_students';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(DeviceToken.name)
    private readonly deviceTokenModel: Model<DeviceTokenDocument>,
    private readonly firebase: FirebaseService,
  ) {}

  async registerToken(dto: RegisterTokenDto, studentId?: string | null) {
    if (!this.firebase.isReady()) {
      throw new BadRequestException('Firebase is not configured on the server');
    }

    const topic = ALL_STUDENTS_TOPIC;
    const update: Partial<DeviceToken> = {
      token: dto.token,
      platform: dto.platform,
      isActive: true,
      topic,
    };
    if (studentId) {
      update.student = new Types.ObjectId(studentId);
    }

    const doc = await this.deviceTokenModel.findOneAndUpdate(
      { token: dto.token },
      { $set: update },
      { upsert: true, new: true },
    );

    try {
      await this.firebase.messaging.subscribeToTopic([dto.token], topic);
    } catch (error) {
      this.logger.warn(`Topic subscribe failed for token: ${error.message}`);
    }

    return { success: true, topic, id: doc._id };
  }

  async sendToTopic(dto: SendNotificationDto) {
    if (!this.firebase.isReady()) {
      throw new BadRequestException('Firebase is not configured on the server');
    }

    const topic = dto.topic || ALL_STUDENTS_TOPIC;

    const message: Message = {
      topic,
      notification: {
        title: dto.title,
        body: dto.body,
      },
      data: {
        title: dto.title,
        body: dto.body,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    const messageId = await this.firebase.messaging.send(message);
    this.logger.log(`Notification sent to topic ${topic}: ${messageId}`);

    return { success: true, messageId, topic };
  }
}
