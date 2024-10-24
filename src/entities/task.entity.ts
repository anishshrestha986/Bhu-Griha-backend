/* eslint-disable @typescript-eslint/no-var-requires */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import toJSON from './plugins/toJSON.plugin';
const paginate = require('mongoose-paginate-v2');
const soft_delete = require('mongoose-delete');

@Schema({
  timestamps: true,
})
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  descirption: string;

  @Prop({ required: true })
  status: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.plugin(toJSON);
TaskSchema.plugin(paginate);
TaskSchema.plugin(soft_delete, {
  overrideMethods: true,
  indexFields: true,
});
