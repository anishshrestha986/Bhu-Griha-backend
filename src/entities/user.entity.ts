import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ unique: true, slug: true })
  username: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, private: true })
  password: string;

  @Prop({ required: true, default: false })
  emailVerified: boolean;

  @Prop({
    required: true,
    type: [
      {
        type: MongooseSchema.Types.ObjectId,
        ref: 'Role',
      },
    ],
  })
  roles: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
