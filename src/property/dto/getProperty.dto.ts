import { GetQueryDto } from '@dto/getQuery.dto';
import { IsValidObjectId } from '@dto/validators/mongoId.decorator';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsObject,
} from 'class-validator';
import { PROPERTY_STATUS } from 'src/types/enums/property-status.enum';
import { PROPERTY_TYPES } from 'src/types/enums/property-types.enum';

export class GetPropertyDto extends GetQueryDto {
  @IsValidObjectId()
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsObject()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: PROPERTY_TYPES;

  @IsString()
  @IsOptional()
  status?: PROPERTY_STATUS;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  location?: string;

  @IsDateString()
  @IsOptional()
  postedOn?: string;

  @IsString()
  @IsOptional()
  postedBy?: string;

  @IsString()
  @IsOptional()
  seller?: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean = false;
}
