import { Document, Model, PaginateModel } from 'mongoose';
import { User } from '@/entities/user.entity';
import { SoftDeleteModel, SoftDeleteDocument } from 'mongoose-delete';

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}

export interface IUserStatics {
  isEmailTaken(email: string): Promise<boolean>;
  isPhoneNumberTaken(phone: string): Promise<boolean>;
}

export type IUserDocument = Omit<
  Document & User & IUserMethods & SoftDeleteDocument,
  '_id' | 'id'
> & { id: string };

export type IUserModel = Model<IUserDocument> &
  IUserStatics &
  SoftDeleteModel<IUserDocument> &
  PaginateModel<IUserDocument>;
