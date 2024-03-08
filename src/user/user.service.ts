import { ROLE, USER_STATUS } from '@enums';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientSession, FilterQuery, PaginateOptions } from 'mongoose';

import { CreateUserDto, RegisterUserDto } from './dto/createUser.dto';
import { UpdateUserDto, UpdateVerification } from './dto/updateUser.dto';
import { UserRepository } from './user.repository';

import EVENTS from '@events';
import { IUserDocument } from '@interfaces/entities';
import { MediaService } from '@/media/media.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mediaService: MediaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createUser(
    createUserDto: CreateUserDto | RegisterUserDto,
    session?: ClientSession,
  ) {
    let profilePicture = createUserDto.profilePicture;
    if (!profilePicture) {
      const media = await this.mediaService.getMediaBy(
        {
          remark: 'Default Avatar',
          isPublic: true,
        },
        {
          sort: { createdAt: -1 },
        },
      );
      profilePicture = media.length > 0 ? media.at(0).id.toString() : null;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let roles = createUserDto.roles;

    if (!roles) {
      roles = [ROLE.USER];
    }

    const user = await this.userRepository.createUser(
      {
        ...createUserDto,
        profilePicture,
        roles,
      },
      session,
    );
    this.eventEmitter.emit(EVENTS.USER_REGISTERED, user);

    return user;
  }

  async getUsers(
    filter: FilterQuery<IUserDocument>,
    options?: PaginateOptions,
  ) {
    const users = await this.userRepository.getUsers(filter, options);

    return users;
  }

  async updateUserById(
    id: string,
    update: UpdateUserDto,
    session?: ClientSession,
  ) {
    const user = await this.userRepository.updateUserById(id, update, session);

    return user;
  }

  async updateUserStatusById(
    id: string,
    status: USER_STATUS,
    session?: ClientSession,
  ) {
    const user = await this.userRepository.updateUserById(
      id,
      { status },
      session,
    );

    this.eventEmitter.emit(EVENTS.USER_STATUS_UPDATED, user);
    return user;
  }

  async updateUserVerificationStatusById(
    id: string,
    verificationUpdate: UpdateVerification,
    session?: ClientSession,
  ) {
    const user = await this.userRepository.updateUserById(
      id,
      verificationUpdate,
      session,
    );

    return user;
  }

  async getUserById(id: string) {
    const user = await this.userRepository.getUserById(id);
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.getUserByEmail(email);
    return user;
  }

  async getUserByPhone(phone: string) {
    const user = await this.userRepository.getUserByPhone(phone);
    return user;
  }

  async getUserByEmailOrPhone(emailOrPhone: string) {
    const user = await this.userRepository.getUserByEmailOrPhone(emailOrPhone);
    return user;
  }

  async getUserByStripeCustomerId(stripeCustomerId: string) {
    const user = await this.userRepository.getUserBy({ stripeCustomerId });
    return user;
  }

  async deleteUserById(
    id: string,
    deletedBy?: string,
    session?: ClientSession,
  ) {
    const user = await this.userRepository.deleteUserById(
      id,
      deletedBy,
      session,
    );
    return user;
  }
}
