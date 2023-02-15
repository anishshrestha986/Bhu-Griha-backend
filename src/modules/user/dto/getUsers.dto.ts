import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class GetUsersDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  role?: string;

  @IsOptional()
  from?: number;

  @IsOptional()
  @IsPositive()
  limit?: number;
}
