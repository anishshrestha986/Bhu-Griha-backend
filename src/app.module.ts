import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomConfigModule } from './config/config.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PropertyModule } from '@/property/property.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';
import { MediaModule } from './media/media.module';
import { SupportTicketModule } from './supportTicket/supportTicket.module';
import { CustomConfigService } from './config/config.service';
import { ConfigModule } from '@nestjs/config';
import { envValidate } from './config/env.validation';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
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
    MediaModule,
    SupportTicketModule,
    UserModule,
    TokenModule,
    PropertyModule,
  ],
  providers: [],
})
export class AppModule {}
