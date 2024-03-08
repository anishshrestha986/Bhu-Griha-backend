import { Media } from '@/entities/media.entity';
import { IMediaDocument, IMediaModel } from '@interfaces/entities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  PaginateOptions,
  PaginateResult,
  QueryOptions,
  Types,
} from 'mongoose';

import { CreateMediaDto } from './dto/createMedia.dto';

@Injectable()
export class MediaRepository {
  constructor(
    @InjectModel(Media.name) private readonly mediaModel: IMediaModel,
  ) {}

  async createBulk(medias: CreateMediaDto[]): Promise<IMediaDocument[]> {
    return this.mediaModel.create(medias);
  }

  async getMediaOfUser(
    userId: string,
    medias: string[],
  ): Promise<IMediaDocument[]> {
    return await this.mediaModel.aggregate().match({
      user: new Types.ObjectId(userId),
      _id: { $in: medias.map((m) => new Types.ObjectId(m)) },
    });
  }

  async getPublicMediaById(id: string) {
    const media: IMediaDocument = await this.mediaModel.findOne({
      _id: new Types.ObjectId(id),
      isPublic: true,
    });
    return media;
  }

  async getAllMedias(
    filter: FilterQuery<IMediaDocument>,
    options: PaginateOptions,
  ) {
    const medias: PaginateResult<IMediaDocument> =
      await this.mediaModel.paginate(filter, options);
    return medias;
  }

  async getMediaBy(
    filter: FilterQuery<IMediaDocument>,
    options?: QueryOptions<IMediaDocument>,
  ) {
    const medias = await this.mediaModel.find(filter, { __v: 0 }, options);
    return medias;
  }
}
