import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class PaginateQueryDto {
  /**
   * Example: createdAt:desc,updatedAt:asc
   */
  @IsOptional()
  @IsString()
  sort?: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit?: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number;
}
export class GetQueryDto extends PaginateQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
