import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { UserRepository } from '@repositories/user.repository';
import { CreateUserDto } from './dto/createUser.dto';
import { IUserDocument } from '@interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { events } from '@events';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async createUser(createUserDto: CreateUserDto, session: ClientSession) {
    const user = await this.userRepository.createUser(createUserDto, session);

    this.eventEmitter.emit(events.USER_REGISTERED, {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    });
    return user;
  }

  async getUserById(id: string) {
    return await this.userRepository.getUserById(id);
  }

  async getUserByEmailOrUsername(
    emailOrUsername: string,
  ): Promise<IUserDocument> {
    return await this.userRepository.getUserByEmailOrUsername(emailOrUsername);
  }
}
