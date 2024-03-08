import {
  Model,
  Document,
  PopulatedDoc,
  AggregatePaginateModel,
} from 'mongoose';
import { Property } from '@entities/property.entity';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';
import { IUserDocument } from './user.interface';
import { PaginateModel } from 'mongoose';
type IPropertyDocument = Document &
  Property &
  SoftDeleteDocument & {
    postedBy: PopulatedDoc<IUserDocument>;
  };

type IPropertyModel = Model<IPropertyDocument> &
  SoftDeleteModel<IPropertyDocument> &
  PaginateModel<IPropertyDocument> &
  AggregatePaginateModel<IPropertyDocument>;

export { IPropertyDocument, IPropertyModel };
