/* eslint-disable @typescript-eslint/no-var-requires */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongooseSchema } from 'mongoose';

import toJSON from './plugins/toJSON.plugin';
const paginate = require('mongoose-paginate-v2');
const soft_delete = require('mongoose-delete');

/*
 * Media entity
 * @desc Used to store local file or cloudinary file
 */
@Schema({
  timestamps: true,
})
export class Media {
  // local file path
  @Prop({ required: false, default: '' })
  filepath: string;

  // Cloudinary public id
  @Prop({ required: false, default: '' })
  public_id: string;

  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({
    required: false,
    ref: 'User',
    type: MongooseSchema.Types.ObjectId,
  })
  user: Types.ObjectId;

  @Prop({
    required: false,
  })
  remark: string;

  @Prop({
    required: false,
    default: false,
  })
  isPublic: boolean;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

MediaSchema.plugin(paginate);
MediaSchema.plugin(toJSON);
MediaSchema.plugin(soft_delete, {
  deletedBy: true,
  deletedAt: true,
  overrideMethods: 'all',
});
