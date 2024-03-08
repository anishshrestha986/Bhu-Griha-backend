import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportTicketController } from './supportTicket.controller';
import { SupportTicketRepository } from './supportTicket.repository';
import { SupportTicketService } from './supportTicket.service';
import {
  SupportTicket,
  SupportTicketSchema,
} from '@/entities/supportTicket.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportTicket.name, schema: SupportTicketSchema },
    ]),
  ],
  controllers: [SupportTicketController],
  providers: [SupportTicketService, SupportTicketRepository],
  exports: [SupportTicketService],
})
export class SupportTicketModule {}
