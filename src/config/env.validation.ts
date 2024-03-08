import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
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

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRATION_TIME: string;

  @IsString()
  REFRESH_EXPIRATION_TIME: string;

  @IsNumber()
  @IsPositive()
  OTP_EXPIRATION_TIME_MINUTE: number;

  @IsString()
  @IsString()
  MAIL_HOST: string;

  @IsPositive()
  @IsNumber()
  MAIL_PORT: number;

  @IsNotEmpty()
  @IsString()
  MAIL_USER: string;

  @IsNotEmpty()
  @IsString()
  MAIL_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  MAIL_FROM: string;

  @IsNotEmpty()
  @IsString()
  CLOUDINARY_CLOUD_NAME: string;

  @IsNotEmpty()
  @IsString()
  CLOUDINARY_API_KEY: string;

  @IsNotEmpty()
  @IsString()
  CLOUDINARY_API_SECRET: string;
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
