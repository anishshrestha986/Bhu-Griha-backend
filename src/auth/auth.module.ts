import { CustomConfigService } from '@/config/config.service';
import { TokenModule } from '@/token/token.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    TokenModule,
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [CustomConfigService],
      useFactory: async (configService: CustomConfigService) => ({
        secret: configService.getJwtConfig().secret,
        signOptions: configService.getJwtConfig().access,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CustomConfigService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
