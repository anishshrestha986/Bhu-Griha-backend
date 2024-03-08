import { SupportTicket } from '@entities/supportTicket.entity';
import { Model, Document, PaginateModel } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';

type ISupportTicketDocument = Document & SupportTicket & SoftDeleteDocument;

type ISupportTicketModel = Model<ISupportTicketDocument> &
  PaginateModel<ISupportTicketDocument> &
  SoftDeleteModel<ISupportTicketDocument>;

export { ISupportTicketDocument, ISupportTicketModel };
