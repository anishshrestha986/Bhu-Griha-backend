import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { urlencoded } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const configService = new ConfigService();
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    cors: {
      origin: '*',
    },
  });

  const PORT = configService.get<number>('PORT');

  const APP_NAME = 'Task Management Api';
  const APP_VERSION = '1.0.0';

  const swaggerConfig = new DocumentBuilder()
    .setTitle(APP_NAME)
    .setDescription(`The ${APP_NAME} API description`)
    .setVersion(APP_VERSION)
    .addBearerAuth()
    .build();

  const swaggerOptions: SwaggerDocumentOptions = {
    operationIdFactory: (_: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
    swaggerOptions,
  );

  SwaggerModule.setup('api-docs', app, document);

  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(PORT);

  logger.log(`Nest application is running on: ${PORT}`);
}
bootstrap();
