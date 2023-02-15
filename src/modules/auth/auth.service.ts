import { UserService } from '@modules/user/user.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserDocument } from '@interfaces';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(user: IUserDocument) {
    const payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async validateUser(
    emailOrUsername: string,
    password: string,
  ): Promise<IUserDocument | null> {
    const user = await this.userService.getUserByEmailOrUsername(
      emailOrUsername,
    );
    if (user && (await user.comparePassword(password))) {
      // TODO: check email verified
      return user;
    }
    return null;
  }
}
