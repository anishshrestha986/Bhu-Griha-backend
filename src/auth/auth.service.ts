import { CustomConfigService } from '@/config/config.service';
import { TokenService } from '@/token/token.service';
import { CreateUserDto, RegisterUserDto } from '@/user/dto/createUser.dto';
import { UpdateUserPasswordDto } from '@/user/dto/updateUser.dto';
import { UserService } from '@/user/user.service';
import { createOTP } from '@/utils/otp.util';
import { ROLE, TOKEN_TYPE } from '@enums';
import EVENTS from '@events';
import { IUserDocument } from '@interfaces/entities';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ClientSession } from 'mongoose';

import { VALID_LOGIN_STATUS } from './constants';
import { ResetPasswordDto } from './dto/password.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: CustomConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly tokenService: TokenService,
  ) {}

  async register(
    user: CreateUserDto | RegisterUserDto,
    session?: ClientSession,
  ) {
    const createdUser = await this.userService.createUser(user, session);

    return createdUser;
  }

  async login(user: IUserDocument, role: ROLE) {
    const payload = { sub: user.id, type: TOKEN_TYPE.ACCESS, role };

    // TODO: revoke refresh token
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(
        { ...payload, type: TOKEN_TYPE.REFRESH },
        this.configService.getJwtConfig().refresh,
      ),
      user: { ...user.toJSON(), role },
    };
  }

  async verifyEmail(userId: string, otp: string, session?: ClientSession) {
    const token = await this.tokenService.getUserToken(
      userId,
      TOKEN_TYPE.EMAIL_VERIFICATION,
    );

    if (!token || token.token !== otp) {
      throw new UnauthorizedException({ message: 'Invalid token' });
    }

    const user = await this.userService.updateUserVerificationStatusById(
      userId,
      { emailVerified: true },
      session,
    );

    await this.tokenService.deleteToken(token.id, session);

    this.eventEmitter.emit(EVENTS.EMAIL_VERIFIED, user);
  }

  async sendEmailVerification(userId: string, session?: ClientSession) {
    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const otp = createOTP();
    await this.tokenService.createToken(
      {
        user: user.id,
        token: otp,
        tokenType: TOKEN_TYPE.EMAIL_VERIFICATION,
      },
      session,
    );

    const updatedUser = await this.userService.updateUserVerificationStatusById(
      user.id,
      { emailVerified: false },
      session,
    );

    this.eventEmitter.emit(EVENTS.EMAIL_VERIFICATION, {
      ...updatedUser.toJSON(),
      otp,
    });

    return updatedUser;
  }

  async sendResetPasswordEmail(userId: string, session?: ClientSession) {
    const user = await this.userService.getUserById(userId);
    const otp = createOTP();
    await this.tokenService.createToken(
      {
        user: user.id,
        token: otp,
        tokenType: TOKEN_TYPE.PASSWORD_RESET,
      },
      session,
    );

    this.eventEmitter.emit(EVENTS.FORGOT_PASSWORD, {
      ...user.toJSON(),
      otp,
    });

    return user;
  }

  async resetPassword(
    userId: string,
    { otp, password }: Omit<ResetPasswordDto, 'email'>,
    session?: ClientSession,
  ) {
    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    const token = await this.tokenService.getUserToken(
      userId,
      TOKEN_TYPE.PASSWORD_RESET,
    );

    if (!token || token.token !== otp) {
      throw new UnauthorizedException({ message: 'Invalid token' });
    }

    await this.changePassword(
      userId,
      {
        newPassword: password,
      },
      session,
    );

    this.eventEmitter.emit(EVENTS.PASSWORD_CHANGED, user);
  }

  async refreshToken(refreshToken: string) {
    const jwtConfig = this.configService.getJwtConfig();
    const refreshPayload = this.jwtService.verify(refreshToken, {
      secret: jwtConfig.secret,
    });

    if (refreshPayload.type !== TOKEN_TYPE.REFRESH) {
      throw new UnauthorizedException({ message: 'Invalid token' });
    }

    const user = await this.userService.getUserById(refreshPayload.sub);

    if (!user) {
      throw new UnauthorizedException({ message: 'Invalid token' });
    }

    const payload = {
      sub: user.id,
      type: TOKEN_TYPE.ACCESS,
      role: refreshPayload.role,
    };

    // TODO: revoke refresh token
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(
        { ...payload, type: TOKEN_TYPE.REFRESH },
        jwtConfig.refresh,
      ),
      user: { ...user.toJSON(), role: refreshPayload.role },
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<IUserDocument | null> {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      return null;
    }

    // TODO: check if email and phone is verified, now only depends on status
    if (!(await user.comparePassword(password))) {
      return null;
    }

    if (!VALID_LOGIN_STATUS.includes(user.status)) {
      throw new UnauthorizedException({
        message: `Your account status is ${user.status}.`,
      });
    }

    return user;
  }

  async changePassword(
    userId: string,
    { currentPassword, newPassword }: Partial<UpdateUserPasswordDto>,
    session?: ClientSession,
  ) {
    if (!newPassword) {
      throw new BadRequestException('New password is required');
    }

    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentPassword && !(await user.comparePassword(currentPassword))) {
      throw new BadRequestException('Invalid current password');
    }

    Object.assign(user, { password: newPassword });

    await user.save({ session });

    this.eventEmitter.emit(EVENTS.PASSWORD_CHANGED, user);

    return user;
  }
}
