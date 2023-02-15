import { Document, Model } from 'mongoose';
import { User } from '@entities/user.entity';

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}
export interface IUserStatics {
  isEmailTaken(email: string): Promise<boolean>;
  isUsernameTaken(username: string): Promise<boolean>;
}

type IUserDocument = Document & User & IUserMethods;

type IUserModel = Model<IUserDocument> & IUserStatics;

export { IUserDocument, IUserModel };
