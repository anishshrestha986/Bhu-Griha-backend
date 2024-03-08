/* eslint-disable @typescript-eslint/no-var-requires */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import toJSON from './plugins/toJSON.plugin';
const paginate = require('mongoose-paginate-v2');
const soft_delete = require('mongoose-delete');

import { Types, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
})
export class SupportTicket {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isResolved: boolean;

  @Prop({ required: false, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user?: Types.ObjectId;
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);

SupportTicketSchema.plugin(toJSON);
SupportTicketSchema.plugin(paginate);
SupportTicketSchema.plugin(soft_delete, {
  overrideMethods: true,
  indexFields: true,
});
