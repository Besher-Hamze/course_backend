// src/students/dto/create-student.dto.ts
import { IsNotEmpty, IsString, IsNumber, Min, Max, IsEnum, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  universityId: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsString()
  deviceNumber: string;
}

