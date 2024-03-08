import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/createMedia.dto';
import { MediaRepository } from './media.repository';
import { FilterQuery, PaginateOptions, QueryOptions } from 'mongoose';
import { IMediaDocument } from '@interfaces/entities';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private cloudinary: CloudinaryService,
  ) {}

  async createBulk(medias: CreateMediaDto[]) {
    return this.mediaRepository.createBulk(medias);
  }

  async uploadImageToCloudinary(file: Express.Multer.File) {
    return await this.cloudinary
      .uploadImage(file)
      .then((result: UploadApiResponse) => ({
        ...result,
        mimetype: file.mimetype,
      }))
      .catch((err: UploadApiErrorResponse) => {
        throw new BadRequestException(err);
      });
  }

  async uploadBulkImagesToCloudinary(files: Express.Multer.File[]) {
    return await Promise.allSettled(
      files.map((file) => this.uploadImageToCloudinary(file)),
    );
  }

  async getPublicMediaById(id: string) {
    return await this.mediaRepository.getPublicMediaById(id);
  }

  async verifyUserMedia(userId: string, medias: string[]) {
    (await this.mediaRepository.getMediaOfUser(userId, medias)).length ===
      medias.length;
  }

  async getUserMedias(
    userId: string,
    filter: FilterQuery<IMediaDocument>,
    options: PaginateOptions,
  ) {
    return await this.mediaRepository.getAllMedias(
      { ...filter, user: userId },
      options,
    );
  }

  async getMediaBy(
    filter: FilterQuery<IMediaDocument>,
    options?: QueryOptions<IMediaDocument>,
  ) {
    return await this.mediaRepository.getMediaBy(filter, options);
  }
}
