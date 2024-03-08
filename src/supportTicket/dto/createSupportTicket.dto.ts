import { IsValidObjectId } from '@/dto/validators/mongoId.decorator';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupportTicketDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  subject: string;
}

export class InternalCreateSupportTicketDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  subject: string;

  @IsOptional()
  @IsValidObjectId()
  @IsString()
  user?: string;
}
