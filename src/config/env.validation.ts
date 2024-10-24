import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsOptional()
  @IsEnum(Environment)
  NODE_ENV?: Environment = Environment.Development;

  @IsPositive()
  @IsNumber()
  PORT: number;

  @IsNotEmpty()
  @IsString()
  MONGO_PROTOCOL: string;

  @IsNotEmpty()
  @IsString()
  MONGO_HOST: string;

  @IsNotEmpty()
  @IsString()
  MONGO_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  MONGO_USER: string;

  @IsNotEmpty()
  @IsString()
  MONGO_DATABASE: string;

  @IsString()
  @IsOptional()
  MONGO_OPTIONS?: string;
}

export function envValidate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
