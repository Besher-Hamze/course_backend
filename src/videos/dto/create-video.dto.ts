import { IsNotEmpty, IsString, IsOptional, IsNumber, IsMongoId } from 'class-validator';

export class CreateVideoDto {
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
  duration: number;

  @IsOptional()
  @IsNumber()
  order: number;
}

