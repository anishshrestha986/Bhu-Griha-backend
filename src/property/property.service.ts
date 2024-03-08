import { Injectable } from '@nestjs/common';
import {
  ClientSession,
  FilterQuery,
  PaginateOptions,
  PopulateOptions,
} from 'mongoose';
import { CreatePropertyDto } from './dto/createProperty.dto';
import { UpdatePropertyDto } from './dto/updateProperty.dto';
import { PropertyRepository } from './property.repository';
import { IPropertyDocument } from '@interfaces/entities';
@Injectable()
export class PropertyService {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async createProperty(
    createPropertyDto: CreatePropertyDto,
    session: ClientSession,
  ) {
    const createdProperty = await this.propertyRepository.create(
      createPropertyDto,
      session,
    );
    return createdProperty;
  }

  async getPropertyById(id: string, populate?: PopulateOptions) {
    return await this.propertyRepository.getById(id, populate);
  }

  async getAllProperties(
    filter: FilterQuery<IPropertyDocument>,
    options: PaginateOptions,
  ) {
    return await this.propertyRepository.getAll(filter, options);
  }

  async updateProperty(
    id: string,
    updateBody: UpdatePropertyDto,
    session: ClientSession,
  ) {
    return await this.propertyRepository.updateById(id, updateBody, session);
  }
  async deleteProperty(id: string, session: ClientSession) {
    return await this.propertyRepository.deleteProperty(id, session);
  }
  async getUserProperties(
    userId: string,
    filter: FilterQuery<IPropertyDocument>,
    options: PaginateOptions,
  ) {
    return await this.propertyRepository.getAll(
      { ...filter, postedBy: userId },
      options,
    );
  }
}
