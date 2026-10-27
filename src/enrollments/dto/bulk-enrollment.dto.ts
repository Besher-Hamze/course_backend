import { ArrayNotEmpty, IsArray, IsBoolean, IsMongoId, IsOptional } from 'class-validator';

export class BulkEnrollmentDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  students: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  courses: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
