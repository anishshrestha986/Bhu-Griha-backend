import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession } from 'mongoose';
import { IUserModel } from '@interfaces';
import { User } from '@entities/user.entity';
import { CreateUserDto } from '../modules/user/dto/createUser.dto';

export class UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: IUserModel) {}

  async createUser(createUserDto: CreateUserDto, session: ClientSession) {
    if (await this.userModel.isEmailTaken(createUserDto.email))
      throw new ConflictException('Email already exists');
    if (await this.userModel.isUsernameTaken(createUserDto.username))
      throw new ConflictException('Username already exists');

    let user = new this.userModel(createUserDto);

    try {
      user = await user.save({ session });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    return user;
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id);
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email });

    return user;
  }

  async getUserByUsername(username: string) {
    const user = await this.userModel.findOne({ username });

    return user;
  }

  async getUserByEmailOrUsername(emailOrUsername: string) {
    const user = await this.userModel.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    return user;
  }

  async verifyEmail(userId: string, session: ClientSession) {
    try {
      await this.userModel.updateOne(
        { _id: userId },
        { $set: { emailVerified: true } },
        session,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
