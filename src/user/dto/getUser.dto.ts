import { PaginateQueryDto } from '@/dto/getQuery.dto';
import { IsValidObjectId } from '@/dto/validators/mongoId.decorator';
import { USER_STATUS } from '@/types/enums';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GetUserDto extends PaginateQueryDto {
  @IsValidObjectId()
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  @IsValidObjectId()
  userId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @IsEnum(USER_STATUS)
  status?: USER_STATUS;
}
