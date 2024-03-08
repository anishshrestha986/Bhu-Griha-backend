import { ROLE } from '@/types/enums';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ enum: Object.values(ROLE) })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEnum(ROLE)
  role?: ROLE;
}
