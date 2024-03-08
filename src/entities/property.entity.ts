/* eslint-disable @typescript-eslint/no-var-requires */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { PROPERTY_STATUS } from 'src/types/enums/property-status.enum';
import { PROPERTY_TYPES } from 'src/types/enums/property-types.enum';
import toJSON from './plugins/toJSON.plugin';
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const paginate = require('mongoose-paginate-v2');
const soft_delete = require('mongoose-delete');

import { User } from './user.entity';
import { Media } from './media.entity';

@Schema({
  _id: false,
})
export class RoomDetails {
  numberOfBedRoom: number;
  numberOfFloors: number;
  numberOfKitchen: number;
  numberOfBathRoom: number;
  numberOfHall: number;
}
export const RoomDetailSchema = SchemaFactory.createForClass(RoomDetails);

@Schema({
  _id: false,
})
export class AmentiesDetails {
  roadType: string;
  distanceFromRoad: string;
  waterSupply: string;
  drainage: string;
  propertyFace: string;
  parking: string;
  electricity: string;
}
export const AmenitiesDetailsSchema =
  SchemaFactory.createForClass(AmentiesDetails);

@Schema({
  _id: false,
})
export class SellerDetails {
  _id: string;
  firstName: string;
  lastName: string;
  contact: string;
  email: string;
  medias: string[];
}
export const SellerDetailsSchema = SchemaFactory.createForClass(SellerDetails);

@Schema({
  _id: false,
})
export class PropertyDescription {
  area: string;
  @Prop({ required: true, type: RoomDetailSchema })
  numberOfRooms: RoomDetails;

  @Prop({ required: true, type: AmenitiesDetailsSchema })
  amenities: AmentiesDetails;

  additionalInformation: string;
}
export const PropertyDescriptionSchema =
  SchemaFactory.createForClass(PropertyDescription);

@Schema({
  timestamps: true,
})
export class Property {
  @Prop({ required: true })
  name: string;
  @Prop()
  summary: string;
  @Prop({ required: true, type: PropertyDescriptionSchema })
  description: PropertyDescription;

  @Prop({
    required: true,
    enum: PROPERTY_TYPES,
  })
  type: PROPERTY_TYPES;

  @Prop({
    required: true,
    enum: PROPERTY_STATUS,
  })
  status: PROPERTY_STATUS;

  @Prop({ required: true })
  location: string;

  @Prop()
  postedOn: Date;

  @Prop({ required: true })
  price: number;

  @Prop()
  likes: number;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: User.name })
  user: Types.ObjectId;

  @Prop({ required: true, type: SellerDetailsSchema })
  seller: SellerDetails;

  @Prop({ default: false, required: true })
  isVerified: boolean;

  @Prop({
    required: false,
    type: [{ type: MongooseSchema.Types.ObjectId, ref: Media.name }],
    default: [],
  })
  propertyImage: Types.ObjectId[];
}
export const PropertySchema = SchemaFactory.createForClass(Property);
PropertyDescriptionSchema.plugin(toJSON);

PropertySchema.plugin(toJSON);
PropertySchema.plugin(paginate);
PropertySchema.plugin(aggregatePaginate);
PropertySchema.plugin(soft_delete, {
  overrideMethods: 'all',
  deletedAt: true,
});
