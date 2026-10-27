import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { CoursesModule } from './courses/courses.module';
import { VideosModule } from './videos/videos.module';
import { FilesModule } from './files/files.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { MulterModule } from '@nestjs/platform-express';
import { TeachersModule } from './teachers/teachers.module';
import { CodesModule } from './codes/codes.module';
import { SeedModule } from './seed/seed.module';
import { StorageModule } from './storage/storage.module';
import { AdsModule } from './ads/ads.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AppSettingsModule } from './app-settings/app-settings.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MulterModule.register({
      dest: './uploads',
    }),
    CommonModule,
    AuthModule,
    StudentsModule,
    CoursesModule,
    VideosModule,
    FilesModule,
    EnrollmentsModule,
    TeachersModule,
    CodesModule,
    SeedModule,
    StorageModule,
    AdsModule,
    NotificationsModule,
    AppSettingsModule,
  ],
})
export class AppModule { }

