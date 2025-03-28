import { IsNotEmpty, IsMongoId, IsBoolean, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEnrollmentDto {
  @IsNotEmpty()
  @IsMongoId()
  student: string;

  @IsNotEmpty()
  @IsMongoId()
  course: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  enrollDate: Date;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
