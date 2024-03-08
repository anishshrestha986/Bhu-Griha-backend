import toJSON from '@/entities/plugins/toJSON.plugin';
import { Token, TokenSchema } from '@/entities/token.entity';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenRepository } from './token.repository';
import { TokenService } from './token.service';
import { ITokenDocument } from '@interfaces/entities';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        inject: [ConfigService],
        name: Token.name,
        useFactory: (configService: ConfigService) => {
          TokenSchema.method(
            'isExpired',
            async function (this: ITokenDocument) {
              const token = await this;
              return (
                Date.parse(token.createdAt.toDateString()) +
                  configService.get<number>('OTP_EXPIRATION_TIME_MINUTE') *
                    60 *
                    1000 <
                Date.now()
              );
            },
          );

          TokenSchema.plugin(toJSON);

          return TokenSchema;
        },
      },
    ]),
  ],
  providers: [TokenService, TokenRepository],
  exports: [TokenService],
})
export class TokenModule {}
