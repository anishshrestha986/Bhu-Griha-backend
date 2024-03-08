import { Injectable } from '@nestjs/common';
import {
  ClientSession,
  FilterQuery,
  PaginateOptions,
  PopulateOptions,
} from 'mongoose';
import { InternalCreateSupportTicketDto } from './dto/createSupportTicket.dto';
import { UpdateSupportTicketDto } from './dto/updateSupportTicket.dto';
import { SupportTicketRepository } from './supportTicket.repository';
import { ISupportTicketDocument } from '@interfaces/entities';
@Injectable()
export class SupportTicketService {
  constructor(
    private readonly supportTicketRepository: SupportTicketRepository,
  ) {}

  async createTicket(
    createTicketDto: InternalCreateSupportTicketDto,
    session?: ClientSession,
  ) {
    const createdTicket = await this.supportTicketRepository.createTicket(
      createTicketDto,
      session,
    );
    return createdTicket;
  }

  async getTicketById(id: string, populate?: PopulateOptions) {
    return await this.supportTicketRepository.getTicketById(id, populate);
  }

  async getAllTicket(
    filter: FilterQuery<ISupportTicketDocument>,
    options: PaginateOptions,
  ) {
    return await this.supportTicketRepository.getAllTicket(filter, options);
  }

  async updateTicket(
    id: string,
    updateBody: UpdateSupportTicketDto,
    session?: ClientSession,
  ) {
    return await this.supportTicketRepository.updateTicketById(
      id,
      updateBody,
      session,
    );
  }
  async deleteTicket(id: string, session?: ClientSession) {
    return await this.supportTicketRepository.deleteTicket(id, session);
  }
}
