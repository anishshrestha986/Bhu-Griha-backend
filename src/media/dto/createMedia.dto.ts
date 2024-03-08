import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  @IsNotEmpty()
  filepath: string;

  @IsString()
  @IsNotEmpty()
  size: number;

  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  remark?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  isPublic?: boolean = false;
}
