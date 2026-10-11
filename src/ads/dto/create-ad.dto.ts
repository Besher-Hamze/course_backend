import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateAdDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  title: string;

  @IsNotEmpty()
  @Matches(/^\+?[0-9\s-]{8,20}$/, { message: 'رقم الواتساب غير صالح، اكتبه مع رمز الدولة مثل 963912345678' })
  whatsappNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  whatsappMessage?: string;
}
