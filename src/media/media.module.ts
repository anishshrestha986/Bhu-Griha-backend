import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from '@/entities/media.entity';
import { IMediaDocument } from '@interfaces/entities/media.interface';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { MediaRepository } from './media.repository';

@Module({
  imports: [
    CloudinaryModule,
    MongooseModule.forFeatureAsync([
      {
        name: Media.name,
        useFactory: () => {
          MediaSchema.method(
            'isMediaofUser',
            async function (this: IMediaDocument, userId): Promise<boolean> {
              const media: IMediaDocument = await this;
              return media.user._id.toHexString() === userId;
            },
          );

          return MediaSchema;
        },
      },
    ]),
  ],
  providers: [MediaService, MediaRepository],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
