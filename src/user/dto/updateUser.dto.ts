import { USER_STATUS } from '@enums';
import { OmitType, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateUserDto } from './createUser.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['roles', 'password'] as const),
) {}

export class UpdateUserRequestDto extends UpdateUserDto {
  // @IsOptional()
  // @IsNotEmpty()
  // @IsString()
  // password?: string;
}

export class UpdateUserAdminDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'name'] as const),
) {}

export class UpdateUserStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(USER_STATUS)
  status: USER_STATUS;
}

export class UpdateVerification {
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  phoneVerified?: boolean;
}

export class UpdateUserPasswordDto {
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
