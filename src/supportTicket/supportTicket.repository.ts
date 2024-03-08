import { SupportTicket } from '@/entities/supportTicket.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, PopulateOptions } from 'mongoose';
import { InternalCreateSupportTicketDto } from './dto/createSupportTicket.dto';
import {
  ISupportTicketDocument,
  ISupportTicketModel,
} from '@interfaces/entities';
import { UpdateSupportTicketDto } from './dto/updateSupportTicket.dto';
import { FilterQuery, PaginateOptions, PaginateResult } from 'mongoose';

export class SupportTicketRepository {
  constructor(
    @InjectModel(SupportTicket.name)
    private readonly supportTicketModel: ISupportTicketModel,
  ) {}

  async getAllTicket(
    filter: FilterQuery<ISupportTicketDocument>,
    options: PaginateOptions,
  ) {
    const tickets: PaginateResult<ISupportTicketDocument> =
      await this.supportTicketModel.paginate(filter, options);
    return tickets;
  }

  async createTicket(
    createTicketDto: InternalCreateSupportTicketDto,
    session?: ClientSession,
  ) {
    const ticket = new this.supportTicketModel(createTicketDto);
    await ticket.save({ session });
    return ticket;
  }

  async getTicketById(ticketId: string, populate?: PopulateOptions) {
    const ticket: ISupportTicketDocument = await this.supportTicketModel
      .findById(ticketId)
      .populate(populate);
    return ticket;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteTicket(ticketId: string, _session?: ClientSession) {
    const ticket: ISupportTicketDocument = await this.getTicketById(ticketId);
    await ticket.delete();
    return ticket;
  }

  async updateTicketById(
    id: string,
    update: Partial<UpdateSupportTicketDto>,
    session?: ClientSession,
  ) {
    const ticket = await this.getTicketById(id);

    if (!ticket) return null;

    Object.assign(ticket, update);

    await ticket.save({ session });
    return ticket;
  }
}
