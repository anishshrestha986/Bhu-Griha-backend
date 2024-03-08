/* eslint-disable @typescript-eslint/no-var-requires */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ROLE, USER_STATUS } from '@enums';
import * as bcrypt from 'bcrypt';
const paginate = require('mongoose-paginate-v2');
const soft_delete = require('mongoose-delete');

import toJSON from './plugins/toJSON.plugin';
import { Media } from './media.entity';
import { Types, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
})
export class User {
  @Prop({ required: true })
  name: string;

  // Is unique
  @Prop({ required: true, index: true })
  email: string;

  // Is unique
  @Prop({ required: true, index: true })
  phone: string;

  @Prop({ required: true, default: false })
  emailVerified: boolean;

  @Prop({ required: true, private: true })
  password: string;

  @Prop({
    required: true,
    type: [
      {
        type: String,
        ref: ROLE,
      },
    ],
  })
  roles: ROLE[];

  @Prop({
    required: true,
    default: USER_STATUS.NOT_VERIFIED,
    enum: USER_STATUS,
  })
  status: USER_STATUS;

  @Prop({
    required: false,
    ref: Media.name,
    type: MongooseSchema.Types.ObjectId,
  })
  profilePicture: Types.ObjectId;

  @Prop({ required: false, private: true })
  suspendedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  if (this.isModified('status')) {
    if (this.status === USER_STATUS.SUSPENDED) {
      this.suspendedAt = new Date();
    } else {
      this.suspendedAt = null;
    }
  }
});

UserSchema.static(
  'isEmailTaken',
  async function (email: string): Promise<boolean> {
    const user = await this.findOne({ email });
    return !!user;
  },
);

UserSchema.static(
  'isPhoneNumberTaken',
  async function (phone: string): Promise<boolean> {
    const user = await this.findOne({ phone });
    return !!user;
  },
);

UserSchema.method(
  'comparePassword',
  async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  },
);

UserSchema.plugin(soft_delete, {
  indexFields: true,
  deletedAt: true,
  deletedBy: true,
  overrideMethods: true,
});

UserSchema.plugin(toJSON);
UserSchema.plugin(paginate);
