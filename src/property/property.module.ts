import { Property, PropertySchema } from '@entities/property.entity';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import * as paginate from 'mongoose-paginate-v2';
import * as soft_delete from 'mongoose-delete';
import toJSON from '@entities/plugins/toJSON.plugin';
import { PropertyRepository } from './property.repository';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Property.name,
        useFactory: () => {
          PropertySchema.plugin(paginate);
          PropertySchema.plugin(soft_delete, {
            overrideMethods: true,
            indexFields: true,
          });
          PropertySchema.plugin(toJSON);
          return PropertySchema;
        },
      },
    ]),
  ],
  controllers: [PropertyController],
  providers: [PropertyService, PropertyRepository],
  exports: [PropertyService, PropertyRepository],
})
export class PropertyModule {}
