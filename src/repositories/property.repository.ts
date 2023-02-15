import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPropertyDocument, IPropertyModel } from '@interfaces';
import { Property } from '@entities/property.entity';
import { CreatePropertyDto } from '../modules/property/dto/createProperty.dto';
import {
  ClientSession,
  FilterQuery,
  PaginateOptions,
  PaginateResult,
  PopulateOptions,
} from 'mongoose';
import { UpdatePropertyDto } from '@modules/property/dto/updateProperty.dto';

export class PropertyRepository {
  constructor(
    @InjectModel(Property.name)
    private readonly PropertyModel: IPropertyModel,
  ) {}

  async createProperty(
    createPropertyDto: CreatePropertyDto,
    session: ClientSession,
  ) {
    const property: IPropertyDocument = new this.PropertyModel(
      createPropertyDto,
    );
    return await property.save({ session });
  }

  async getPropertyById(propertyId: string, populate?: PopulateOptions) {
    const property: IPropertyDocument = await this.PropertyModel.findById(
      propertyId,
    ).populate(populate);
    return property;
  }

  async getAllProperties(
    filter: FilterQuery<IPropertyDocument>,
    options: PaginateOptions,
  ) {
    const propertys: PaginateResult<IPropertyDocument> =
      await this.PropertyModel.paginate(filter, options);
    return propertys;
  }

  async updateProperty(
    propertyId: string,
    updateParams: UpdatePropertyDto,
    session: ClientSession,
  ) {
    const property: IPropertyDocument = await this.getPropertyById(propertyId);
    if (!property) throw new NotFoundException('Property not found');

    Object.assign(property, updateParams);
    await property.save({ session });
    return property;
  }

  async deleteProperty(propertyId: string, session: ClientSession) {
    const property: IPropertyDocument = await this.getPropertyById(propertyId);
    if (!property) throw new NotFoundException('Property not found');
    try {
      await property.delete({ session });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
