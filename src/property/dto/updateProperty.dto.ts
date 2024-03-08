import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './createProperty.dto';

export class UpdatePropertyDto extends OmitType(
  PartialType(CreatePropertyDto),
  ['postedBy'] as const,
) {}
