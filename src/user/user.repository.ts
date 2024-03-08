import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, FilterQuery, PaginateOptions } from 'mongoose';
import { IUserDocument, IUserModel } from '@interfaces/entities';
import { User } from '@/entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  UpdateUserAdminDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  UpdateVerification,
} from './dto/updateUser.dto';
import { ROLE, USER_STATUS } from '@/types/enums';

export class UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: IUserModel) {}

  async createUser(createUserDto: CreateUserDto, session?: ClientSession) {
    if (await this.userModel.isEmailTaken(createUserDto.email))
      throw new ConflictException('Email already exists');
    if (await this.userModel.isPhoneNumberTaken(createUserDto.phone))
      throw new ConflictException('Phone number already exists');

    let user = new this.userModel(createUserDto);

    try {
      user = await user.save({ session });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    return user;
  }

  async getUsers(
    filter: FilterQuery<IUserDocument>,
    options?: PaginateOptions,
  ) {
    const users = await this.userModel.paginate(filter, options);

    return users;
  }

  async getUserById(id: string) {
    const user: IUserDocument = await this.userModel.findById(id);
    return user;
  }

  async getUserByEmail(email: string) {
    const user: IUserDocument = await this.userModel.findOne({ email });
    return user;
  }

  async getUserByPhone(phone: string) {
    const user: IUserDocument = await this.userModel.findOne({ phone });
    return user;
  }

  async getUserByEmailOrPhone(emailOrPhone: string) {
    const user = await this.userModel.findOne({
      $or: [{ email: emailOrPhone }, { username: emailOrPhone }],
    });

    return user;
  }

  async updateUserById(
    id: string,
    update: Partial<
      UpdateUserDto &
        UpdateUserStatusDto &
        UpdateVerification &
        UpdateUserAdminDto
    >,
    session?: ClientSession,
  ) {
    const user = await this.getUserById(id);

    if (!user) return null;

    if (update.email === user.email) delete update.email;
    if (update.phone === user.phone) delete update.phone;

    if (update.email && (await this.userModel.isEmailTaken(update.email)))
      throw new ConflictException('Email already exists');

    if (update.phone && (await this.userModel.isPhoneNumberTaken(update.phone)))
      throw new ConflictException('Phone number already exists');

    const emailVerified = update.email
      ? false
      : update.emailVerified ?? user.emailVerified;

    const statusUnchangedStaus: USER_STATUS[] = [
      USER_STATUS.BANNED,
      USER_STATUS.SUSPENDED,
    ];

    if (!statusUnchangedStaus.includes(update.status)) {
      if (emailVerified) {
        update.status = USER_STATUS.ACTIVE;
      }
    }

    if (user.roles.includes(ROLE.ADMIN)) {
      if (
        (update.roles && !update.roles.includes(ROLE.ADMIN)) ||
        (update.status && update.status !== USER_STATUS.ACTIVE)
      ) {
        const otherAdmins = await this.userModel.find({
          _id: { $ne: user.id },
          roles: ROLE.ADMIN,
        });

        if (otherAdmins.length === 0) {
          throw new ConflictException(
            'There must be at least one admin in the system',
          );
        }
      }
    }

    Object.assign(user, update, { emailVerified });

    await user.save({ session });

    return user;
  }

  async getUserBy(filter: FilterQuery<IUserDocument>) {
    const user = await this.userModel.findOne(filter);
    return user;
  }

  async deleteUserById(
    id: string,
    deletedBy?: string,
    session?: ClientSession,
  ): Promise<IUserDocument> {
    const user = await this.getUserById(id);

    if (user.roles.includes(ROLE.ADMIN)) {
      const otherAdmins = await this.userModel.find({
        _id: { $ne: user.id },
        roles: ROLE.ADMIN,
      });

      if (otherAdmins.length === 0) {
        throw new ConflictException(
          'There must be at least one admin in the system',
        );
      }
    }

    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await user.delete(deletedBy, { session });

    return user;
  }
}
