import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from 'src/courses/schemas/course.schema';
import { CourseAccessService } from './services/course-access.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
  ],
  providers: [CourseAccessService],
  exports: [CourseAccessService],
})
export class CommonModule {}
