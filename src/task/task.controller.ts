import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, FilterQuery, PaginateOptions, Types } from 'mongoose';
import { CreateTaskDto } from './dto/createTask.dto';
import { NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetQueryDto } from '@/dto/getQuery.dto';
import { pick } from '@/utils/object.util';
import { ITaskDocument } from '@interfaces/entities';

@ApiTags('Support Task')
@Controller('support-Task')
export class TaskController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private Taskservice: TaskService,
  ) {}

  @Get('/')
  async getAllTasks(@Query() query: GetQueryDto) {
    const filter: FilterQuery<ITaskDocument> = pick(query, ['q']);
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

    const Tasks = await this.Taskservice.getAllTask(filter, options);
    return Tasks;
  }

  @Post('/')
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    const createTaskData = new CreateTaskDto();
    Object.assign(createTaskData, createTaskDto);
    try {
      const Task = await this.Taskservice.createTask(createTaskData, session);
      await session.commitTransaction();

      return Task;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException();
    } finally {
      session.endSession();
    }
  }

  @Get('/:id')
  async getTaskById(@Param('id') id: string) {
    const Task = await this.Taskservice.getTaskById(id);
    if (!Task) throw new NotFoundException('Task not found');
    return Task;
  }
}
