import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSupportTicketDto } from './createSupportTicket.dto';

export class UpdateSupportTicketDto extends PartialType(
  OmitType(CreateSupportTicketDto, ['email', 'name']),
) {}
