import {
  Controller,
  Post,
  UseGuards,
  Get,
  Body,
  Param,
  Query,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { SupportTicketService } from './supportTicket.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, FilterQuery, PaginateOptions, Types } from 'mongoose';
import {
  CreateSupportTicketDto,
  InternalCreateSupportTicketDto,
} from './dto/createSupportTicket.dto';
import { JwtAuthGuard } from '@classes/jwt-auth.guard';
import { NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetQueryDto } from '@/dto/getQuery.dto';
import { Roles } from '@decorators/role.decorator';
import { RolesGuard } from '@classes/role.guard';
import { ROLE } from '@/types/enums';
import { pick } from '@/utils/object.util';
import { ISupportTicketDocument } from '@interfaces/entities';
import {
  CurrentRequestUser,
  CurrentUser,
} from '@decorators/current-user.decorator';
import { Public } from '@decorators/public-route.decorator';
import { JwtLooseAuthGuard } from '@classes/jwt-loose-auth.guard';
import { ValidateObjectIdPipe } from '@/dto/validators/mongoId.decorator';

@ApiTags('Support Ticket')
@Controller('support-ticket')
export class SupportTicketController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private supportTicketService: SupportTicketService,
  ) {}

  @ApiBearerAuth()
  @Roles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/')
  async getAllTickets(@Query() query: GetQueryDto) {
    const filter: FilterQuery<ISupportTicketDocument> = pick(query, ['q']);
    const options: PaginateOptions = pick(query, [
      'limit',
      'page',
      'sort',
      'pagination',
    ]);

    if (filter.q) {
      filter['$or'] = [
        { name: { $regex: filter.q, $options: 'i' } },
        { email: { $regex: filter.q, $options: 'i' } },
        { subject: { $regex: filter.q, $options: 'i' } },
      ];

      delete filter.q;
    }

    const tickets = await this.supportTicketService.getAllTicket(
      filter,
      options,
    );
    return tickets;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/my-tickets')
  async getMyTickets(
    @Query() query: GetQueryDto,
    @CurrentUser() user: CurrentRequestUser,
  ) {
    const filter: FilterQuery<ISupportTicketDocument> = pick(query, ['q']);
    const options: PaginateOptions = pick(query, [
      'limit',
      'page',
      'sort',
      'pagination',
    ]);

    if (filter.q) {
      filter.subject = { $regex: filter.q, $options: 'i' };
      delete filter.q;
    }

    filter['$or'] = [
      { user: new Types.ObjectId(user.id) },
      { email: user.email },
    ];

    const tickets = await this.supportTicketService.getAllTicket(
      filter,
      options,
    );
    return tickets;
  }

  @ApiBearerAuth()
  @Public()
  @UseGuards(JwtLooseAuthGuard)
  @Post('/')
  async createTicket(
    @Body() createTicketDto: CreateSupportTicketDto,
    @CurrentUser() user: CurrentRequestUser,
  ) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    const createTicketData = new InternalCreateSupportTicketDto();
    Object.assign(createTicketData, createTicketDto);
    try {
      if (user) createTicketData.user = user.id;
      const ticket = await this.supportTicketService.createTicket(
        createTicketData,
        session,
      );
      await session.commitTransaction();

      return ticket;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException();
    } finally {
      session.endSession();
    }
  }

  @Get('/:id')
  async getTicketById(@Param('id') id: string) {
    const ticket = await this.supportTicketService.getTicketById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  @ApiBearerAuth()
  @Roles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/:id/resolve')
  async resolveTicket(@Param('id', ValidateObjectIdPipe) id: string) {
    const ticket = await this.supportTicketService.getTicketById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');

    ticket.isResolved = true;
    await ticket.save();
    return ticket;
  }
}
