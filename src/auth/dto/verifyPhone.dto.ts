import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPhoneDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class SendPhoneVerificationDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
}
