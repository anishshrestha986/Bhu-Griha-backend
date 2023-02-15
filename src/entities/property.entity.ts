import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { PROPERTY_STATUS } from 'src/types/enums/property-status.enum';
import { PROPERTY_TYPES } from 'src/types/enums/property-types.enum';

@Schema({
  timestamps: true,
})
@Schema()
export class propertiesDescription {
  area: string;
  numberOfRooms: roomDetails;
  amenities: amentiesDetails;
  additionalInformation: string;
}
@Schema()
export class roomDetails {
  numberOfBedRoom: number;
  numberOfFloors: number;
  numberOfKitchen: number;
  numberOfBathRoom: number;
  numberOfHall: number;
}

@Schema()
export class amentiesDetails {
  roadType: string;
  distanceFromRoad: string;
  waterSupply: string;
  drainage: string;
  propertyFace: string;
  parking: string;
  electricity: string;
}
@Schema()
export class sellerDetails {
  _id: string;
  firstName: string;
  lastName: string;
  contact: string;
  email: string;
  medias: string[];
}
export class Property {
  @Prop({ required: true })
  name: string;
  @Prop()
  summary: string;
  @Prop({ required: true })
  description: propertiesDescription;

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

  @Prop({ requires: true, ref: 'Queries', type: MongooseSchema.Types.ObjectId })
  queries: Types.ObjectId;

  @Prop({ required: true, ref: 'User', type: MongooseSchema.Types.ObjectId })
  postedBy: Types.ObjectId;

  @Prop({ required: true })
  seller: sellerDetails;

  @Prop({ default: false, required: true })
  urgent: boolean;

  @Prop({
    required: true,
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Media' }],
  })
  medias: Types.ObjectId[];
}
export const PropertySchema = SchemaFactory.createForClass(Property);
