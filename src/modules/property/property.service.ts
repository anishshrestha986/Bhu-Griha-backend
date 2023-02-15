import { Injectable } from '@nestjs/common';
import {
  ClientSession,
  FilterQuery,
  PaginateOptions,
  PopulateOptions,
} from 'mongoose';
import { PropertyRepository } from '@repositories/property.repository';
import { IPropertyDocument } from '@interfaces';
import { CreatePropertyDto } from './dto/createProperty.dto';
import { UpdatePropertyDto } from './dto/updateProperty.dto';
@Injectable()
export class PropertyService {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async createProperty(
    createPropertyDto: CreatePropertyDto,
    session: ClientSession,
  ) {
    const createdProperty = await this.propertyRepository.createProperty(
      createPropertyDto,
      session,
    );
    return createdProperty;
  }

  async getPropertyById(id: string, populate?: PopulateOptions) {
    return await this.propertyRepository.getPropertyById(id, populate);
  }

  async getAllProperties(
    filter: FilterQuery<IPropertyDocument>,
    options: PaginateOptions,
  ) {
    return await this.propertyRepository.getAllProperties(filter, options);
  }

  async updateProperty(
    id: string,
    updateBody: UpdatePropertyDto,
    session: ClientSession,
  ) {
    return await this.propertyRepository.updateProperty(
      id,
      updateBody,
      session,
    );
  }
  async deleteProperty(id: string, session: ClientSession) {
    return await this.propertyRepository.deleteProperty(id, session);
  }
  async getUserProperties(
    userId: string,
    filter: FilterQuery<IPropertyDocument>,
    options: PaginateOptions,
  ) {
    return await this.propertyRepository.getAllProperties(
      { ...filter, postedBy: userId },
      options,
    );
  }
}
