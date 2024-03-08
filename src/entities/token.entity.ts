import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { TOKEN_TYPE } from '@enums';
import { User } from './user.entity';

@Schema({
  timestamps: true,
})
export class Token {
  @Prop({ required: true, ref: User.name, type: MongooseSchema.Types.ObjectId })
  user: User;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true, enum: TOKEN_TYPE })
  tokenType: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
