import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description: string;

  @IsBoolean()
  status = false;
}
