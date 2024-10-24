import { Injectable } from '@nestjs/common';
import {
  ClientSession,
  FilterQuery,
  PaginateOptions,
  PopulateOptions,
} from 'mongoose';
import { UpdateTaskDto } from './dto/updateTask.dto';
import { TaskRepository } from './task.repository';
import { ITaskDocument } from '@interfaces/entities';
import { CreateTaskDto } from './dto/createTask.dto';
@Injectable()
export class TaskService {
  constructor(private readonly TaskRepository: TaskRepository) {}

  async createTask(createTaskDto: CreateTaskDto, session?: ClientSession) {
    const createdTask = await this.TaskRepository.createTask(
      createTaskDto,
      session,
    );
    return createdTask;
  }

  async getTaskById(id: string, populate?: PopulateOptions) {
    return await this.TaskRepository.getTaskById(id, populate);
  }

  async getAllTask(
    filter: FilterQuery<ITaskDocument>,
    options: PaginateOptions,
  ) {
    return await this.TaskRepository.getAllTask(filter, options);
  }

  async updateTask(
    id: string,
    updateBody: UpdateTaskDto,
    session?: ClientSession,
  ) {
    return await this.TaskRepository.updateTaskById(id, updateBody, session);
  }
  async deleteTask(id: string, session?: ClientSession) {
    return await this.TaskRepository.deleteTask(id, session);
  }
}
