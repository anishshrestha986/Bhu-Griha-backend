import { DEFAULT_PAGE, DEFAULT_SORT, LIMIT_PER_PAGE } from './constants';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { colonToObject } from '@/utils/object.util';
import { ApiProperty } from '@nestjs/swagger';

export class PaginateQueryDto {
  @ApiProperty({
    description: 'Example: createdAt:desc,updatedAt:asc',
    required: false,
    type: String,
    default: DEFAULT_SORT,
  })
  @Transform(({ value }) => {
    return colonToObject(value);
  })
  @IsOptional()
  @IsObject()
  sort = colonToObject(DEFAULT_SORT);

  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit?: number = LIMIT_PER_PAGE;

  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number = DEFAULT_PAGE;

  @Transform(({ value }) => {
    if (value === 'false') return false;
    if (value === 'true') return true;
  })
  @IsOptional()
  @IsBoolean()
  pagination?: boolean = true;
}

export class GetQueryDto extends PaginateQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
