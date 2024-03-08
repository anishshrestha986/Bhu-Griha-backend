import { Property } from '@/entities/property.entity';
import { IPropertyDocument, IPropertyModel } from '@interfaces/entities';
import { InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  FilterQuery,
  PaginateOptions,
  PipelineStage,
  PopulateOptions,
  Types,
} from 'mongoose';
import { CreatePropertyDto } from './dto/createProperty.dto';
import { UpdatePropertyDto } from './dto/updateProperty.dto';

export class PropertyRepository {
  constructor(
    @InjectModel(Property.name)
    private readonly propertyModel: IPropertyModel,
  ) {}

  async create(
    property: CreatePropertyDto,
    session?: ClientSession,
  ): Promise<IPropertyDocument> {
    const createdProperty = new this.propertyModel({
      ...property,
    });
    return createdProperty.save({ session });
  }

  async getAll(
    filters: FilterQuery<IPropertyDocument>,
    options: PaginateOptions,
  ) {
    const propertys = await this.propertyModel.paginate(filters, options);
    return propertys;
  }

  async getAllFromAggregate(
    pipeline: PipelineStage[],
    options: PaginateOptions,
  ) {
    const aggregate = this.propertyModel.aggregate(pipeline);
    const propertys = await this.propertyModel.aggregatePaginate(
      aggregate,
      options,
    );
    return propertys;
  }

  async getById(
    id: string,
    populate?: PopulateOptions,
  ): Promise<IPropertyDocument> {
    return this.propertyModel.findById(id).populate(populate);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteProperty(id: string, _session?: ClientSession) {
    const property: IPropertyDocument = await this.getById(id);
    await property.delete();
    return property;
  }
  async getByIdDeleted(
    id: string,
    populate?: PopulateOptions,
  ): Promise<IPropertyDocument> {
    return this.propertyModel
      .findOneWithDeleted({
        _id: new Types.ObjectId(id),
      })
      .populate(populate);
  }

  async updateById(
    id: string,
    propertyBody: UpdatePropertyDto,
    session?: ClientSession,
  ): Promise<IPropertyDocument> {
    const property = await this.getById(id);

    if (!property) {
      return null;
    }

    property.set(propertyBody);
    return property.save({ session });
  }

  async deleteById(
    id: string,
    session?: ClientSession,
  ): Promise<IPropertyDocument> {
    const property = await this.getById(id);

    if (!property) {
      return null;
    }

    // FIXME: session is not working
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return property.delete({ session });
  }
}
