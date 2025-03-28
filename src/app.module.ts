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
import { RealEstateModule } from './dummy/real-estate.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
    StudentsModule,
    CoursesModule,
    VideosModule,
    FilesModule,
    EnrollmentsModule,
  ],
})
export class AppModule { }

