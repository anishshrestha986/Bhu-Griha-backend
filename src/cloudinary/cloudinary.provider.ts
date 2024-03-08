import { v2 } from 'cloudinary';
import { CLOUDINARY } from './constants';
import { CustomConfigService } from '@/config/config.service';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  inject: [CustomConfigService],
  useFactory: (configService: CustomConfigService) => {
    return v2.config(configService.getCloudinaryConfig());
  },
};
