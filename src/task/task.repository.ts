import { Task } from '@entities/task.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  AggregatePaginateResult,
  ClientSession,
  PopulateOptions,
} from 'mongoose';
import { ITaskDocument, ITaskModel } from '@interfaces/entities';
import { UpdateTaskDto } from './dto/updateTask.dto';
import { FilterQuery, PaginateOptions } from 'mongoose';
import { CreateTaskDto } from './dto/createTask.dto';
import { validateIfPipelineStage } from '@utils/mongodb.util';

export class TaskRepository {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: ITaskModel,
  ) {}

  async getAllTask(
    filter: FilterQuery<ITaskDocument>,
    options: PaginateOptions,
    aggregate?: boolean,
  ) {
    if (validateIfPipelineStage(filter, aggregate)) {
      const aggregate = this.taskModel.aggregate(filter);
      const tasks = await this.taskModel.aggregatePaginate(aggregate, options);

      return tasks;
    }
  }

  async createTask(createTaskDto: CreateTaskDto, session?: ClientSession) {
    const Task = new this.taskModel(createTaskDto);
    await Task.save({ session });
    return Task;
  }

  async getTaskById(TaskId: string, populate?: PopulateOptions) {
    const Task: ITaskDocument = await this.taskModel
      .findById(TaskId)
      .populate(populate);
    return Task;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteTask(TaskId: string, _session?: ClientSession) {
    const Task: ITaskDocument = await this.getTaskById(TaskId);
    await Task.delete();
    return Task;
  }

  async updateTaskById(
    id: string,
    update: Partial<UpdateTaskDto>,
    session?: ClientSession,
  ) {
    const Task = await this.getTaskById(id);

    if (!Task) return null;

    Object.assign(Task, update);

    await Task.save({ session });
    return Task;
  }
}
