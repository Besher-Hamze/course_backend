// src/courses/dto/create-course.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  major: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  yearLevel: number;

  @IsNotEmpty()
  @IsEnum([1, 2])
  semester: number;
}

