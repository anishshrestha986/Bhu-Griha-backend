import { Model, Document, PopulatedDoc } from 'mongoose';
import { Property } from '@entities/property.entity';
import { SoftDeleteModel } from 'mongoose-delete';
import { IUserDocument } from './user.interface';
import { PaginateModel } from 'mongoose';
type IPropertyDocument = Document &
  Property & {
    postedBy: PopulatedDoc<IUserDocument>;
  };

type IPropertyModel = Model<IPropertyDocument> &
  SoftDeleteModel<IPropertyDocument> &
  PaginateModel<IPropertyDocument>;

export { IPropertyDocument, IPropertyModel };
