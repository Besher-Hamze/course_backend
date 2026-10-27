import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  body: string;

  /** Defaults to all_students */
  @IsOptional()
  @IsString()
  topic?: string;
}
