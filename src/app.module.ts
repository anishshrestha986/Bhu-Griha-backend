import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomConfigModule } from './config/config.module';
import { TaskModule } from './task/task.module';
import { CustomConfigService } from './config/config.service';
import { ConfigModule } from '@nestjs/config';
import { envValidate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: envValidate,
      isGlobal: true,
      cache: true,
    }),
    CustomConfigModule,
    MongooseModule.forRootAsync({
      inject: [CustomConfigService],
      useFactory: async (configService: CustomConfigService) =>
        configService.getMongoConfig(),
    }),
    TaskModule,
  ],
  providers: [],
})
export class AppModule {}
