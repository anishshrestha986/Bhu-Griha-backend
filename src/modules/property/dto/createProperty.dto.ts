import { OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsBoolean,
  IsPositive,
  IsOptional,
  IsNumber,
  IsDateString,
  IsObject,
} from 'class-validator';
import { PROPERTY_STATUS } from 'src/types/enums/property-status.enum';
import { PROPERTY_TYPES } from 'src/types/enums/property-types.enum';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsObject()
  description: string;

  @IsString()
  @IsOptional()
  type: PROPERTY_TYPES;

  @IsString()
  @IsOptional()
  status: PROPERTY_STATUS;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsDateString()
  postedOn?: string;

  @Transform(
    ({ value }) => typeof value === 'number' && Number(value.toFixed(2)),
  )
  @IsPositive()
  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  postedBy?: string;

  @IsString()
  @IsOptional()
  seller?: string;

  @IsBoolean()
  @IsOptional()
  urgent?: boolean = false;

  @IsArray()
  medias?: string[] = [];
}

export class UserCreatePropertyDto extends OmitType(CreatePropertyDto, [
  'postedOn',
  'postedBy',
]) {}
