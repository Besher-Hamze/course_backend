import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course, CourseSchema } from './schemas/course.schema';
import { Enrollment, EnrollmentSchema } from 'src/enrollments/schemas/enrollment.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Course.name, schema: CourseSchema },
        { name: Enrollment.name, schema: EnrollmentSchema },
      ]
    ),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule { }
