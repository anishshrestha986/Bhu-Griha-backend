import { ROLE } from '@/types/enums';
import { RegisterUserDto } from '@/user/dto/createUser.dto';
import {
  UpdateUserPasswordDto,
  UpdateUserRequestDto,
} from '@/user/dto/updateUser.dto';
import { UserService } from '@/user/user.service';
import { JwtAuthGuard } from '@classes/jwt-auth.guard';
import { JwtLooseAuthGuard } from '@classes/jwt-loose-auth.guard';
import { LocalAuthGuard } from '@classes/local-auth.guard';
import {
  CurrentRequestUser,
  CurrentUser,
} from '@decorators/current-user.decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import {
  SendEmailVerificationDto,
  VerifyEmailDto,
} from './dto/verifyEmail.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('/register')
  async register(@Body() createUserDto: RegisterUserDto) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const user = await this.authService.register(createUserDto, session);
      await session.commitTransaction();

      return user;
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException();
    } finally {
      session.endSession();
    }
  }

  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@CurrentUser() user: CurrentRequestUser, @Body() body: LoginDto) {
    if (user.roles.includes(ROLE.ADMIN)) {
      // TODO: handle when seller and admin have same email
      if (body.role !== ROLE.USER) body.role = ROLE.ADMIN;
    }

    if (!body.role) {
      throw new BadRequestException({
        message: 'Role is required for this user',
      });
    }

    if (!user.roles.includes(body.role)) {
      throw new UnauthorizedException({
        message: 'You are unauthorized as your requested role.',
      });
    }

    return this.authService.login(user, body.role);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/send-email-verification')
  async sendEmailVerification(@Body() body: SendEmailVerificationDto) {
    const user = await this.userService.getUserByEmail(body.email);
    if (!user) {
      // TODO: prevent user enumeration
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      await this.authService.sendEmailVerification(user.id, session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException();
    } finally {
      session.endSession();
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/verify-email')
  async verifyEmail(@Body() body: VerifyEmailDto) {
    const user = await this.userService.getUserByEmail(body.email);
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      await this.authService.verifyEmail(user.id, body.otp, session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(error);
    } finally {
      session.endSession();
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('/forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const returnInfo = {
      message:
        'If you have registered with this email, you will receive an email with OTP to reset your password.',
    };

    const user = await this.userService.getUserByEmail(body.email);

    if (!user) return returnInfo;

    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      await this.authService.sendResetPasswordEmail(user.id, session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException({ cause: error });
    } finally {
      session.endSession();
    }

    return returnInfo;
  }

  @HttpCode(HttpStatus.OK)
  @Post('/reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    const returnInfo = {
      message: 'Your password has been reset successfully.',
    };

    const user = await this.userService.getUserByEmail(body.email);

    if (!user) return returnInfo;

    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      await this.authService.resetPassword(
        user.id,
        {
          password: body.password,
          otp: body.otp,
        },
        session,
      );
      await session.commitTransaction();

      return returnInfo;
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException({ cause: error });
    } finally {
      session.endSession();
    }
  }

  @Post('/refresh-token')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refresh_token);
  }

  @ApiBearerAuth()
  @UseGuards(JwtLooseAuthGuard)
  @Get('/me')
  async getUser(@CurrentUser() user: CurrentRequestUser) {
    return user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtLooseAuthGuard)
  @Patch('/me')
  async updateUser(
    @CurrentUser() user: CurrentRequestUser,
    @Body() dto: UpdateUserRequestDto,
  ) {
    // TODO: check password if email or phone is updated
    // const userDoc = await this.userService.getUserById(user.id);

    // if (dto.email || dto.phone) {
    //   if (!dto.password) {
    //     throw new BadRequestException('Password is required');
    //   }
    //
    //   if (!(await userDoc.comparePassword(dto.password))) {
    //     throw new BadRequestException('Password is incorrect');
    //   }
    // }
    //
    // delete dto.password;

    const updatedUser = await this.userService.updateUserById(user.id, dto);

    if (dto.email) {
      await this.authService.sendEmailVerification(updatedUser.id);
    }

    return updatedUser;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('/me/change-password')
  async changePassword(
    @CurrentUser() user: CurrentRequestUser,
    @Body() dto: UpdateUserPasswordDto,
  ) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      await this.authService.changePassword(user.id, dto, session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(error);
    } finally {
      session.endSession();
    }
  }
}
