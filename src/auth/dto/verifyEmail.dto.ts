import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class SendEmailVerificationDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}
