import { INVALID_REGISTRATION_ROLE } from '@/auth/constants';
import { IsValidObjectId } from '@/dto/validators/mongoId.decorator';
import { ROLE } from '@/types/enums';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';

const VALID_REGISTRATION_ROLES = Object.values(ROLE).filter(
  (role) => !INVALID_REGISTRATION_ROLE.includes(role),
);

@ValidatorConstraint()
export class IsValidRole implements ValidatorConstraintInterface {
  public async validate(roleData: ROLE[]) {
    return roleData.every((role) => VALID_REGISTRATION_ROLES.includes(role));
  }
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    name: 'roles',
    enum: VALID_REGISTRATION_ROLES,
    description: `Valid roles are ${VALID_REGISTRATION_ROLES.join(', ')}`,
  })
  @IsString()
  @IsNotEmpty()
  @Validate(IsValidRole, {
    message: `Invalid role. Valid roles are ${VALID_REGISTRATION_ROLES.join(
      ', ',
    )}`,
  })
  roles: ROLE[];

  @IsOptional()
  @IsValidObjectId()
  profilePicture?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class RegisterUserDto extends OmitType(CreateUserDto, [
  'roles',
] as const) {}
