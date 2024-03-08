import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AdminMediaUploadDto {
  @ApiProperty({ type: 'string', isArray: true, format: 'binary' })
  'files[]': any[];

  @ApiProperty({ type: 'string', description: 'Remark' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ type: 'boolean', description: 'Is public' })
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @IsBoolean()
  isPublic = false;
}

export class MediaUploadDto {
  @ApiProperty({ type: 'string', isArray: true, format: 'binary' })
  'files[]': any[];

  @ApiProperty({ type: 'boolean', description: 'Is public' })
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @IsBoolean()
  isPublic = false;
}
