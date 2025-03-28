import { IsNotEmpty, IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateFileDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  filePath: string;

  @IsNotEmpty()
  @IsMongoId()
  course: string;

  @IsOptional()
  @IsString()
  fileType: string;
}
