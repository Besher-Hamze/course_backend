import { IsNotEmpty, IsString, IsOptional, IsNumber, IsMongoId, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

const toIdList = ({ value }: { value: unknown }): string[] | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  const text = String(value).trim();
  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return [text];
    }
  }
  return text.split(',').map((id) => id.trim()).filter(Boolean);
};

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

  @IsOptional()
  @IsMongoId()
  course?: string;

  /** Upload the same file once and attach it to every listed course. */
  @IsOptional()
  @Transform(toIdList)
  @IsArray()
  @IsMongoId({ each: true })
  courses?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  duration?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  order?: number;
}
