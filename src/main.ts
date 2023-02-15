import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const config = new ConfigService();
  const logger = new Logger('bootstrap');

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  logger.log(`Nest application is running on: ${config.getPortConfig()}`);

  await app.listen(3000);
}
bootstrap();
