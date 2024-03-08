import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { CustomConfigService } from '@/config/config.service';
import { TOKEN_TYPE } from '@/types/enums';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    //eslint-disable-next-line no-unused-vars
    private configService: CustomConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('access_token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getJwtConfig().secret,
    });
  }

  async validate(payload: any) {
    const { sub: userId, type, role } = payload;

    if (type !== TOKEN_TYPE.ACCESS) {
      throw new UnauthorizedException('Invalid token type');
    }

    let user = await this.userService.getUserById(userId);
    user = user.toJSON();

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return { ...user, role };
  }
}
