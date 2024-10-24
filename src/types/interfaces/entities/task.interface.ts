import { Task } from '@entities/task.entity';
import { Model, Document, AggregatePaginateModel } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';

type ITaskDocument = Document & Task & SoftDeleteDocument;

type ITaskModel = Model<ITaskDocument> &
  AggregatePaginateModel<ITaskDocument> &
  SoftDeleteModel<ITaskDocument>;

export { ITaskDocument, ITaskModel };
