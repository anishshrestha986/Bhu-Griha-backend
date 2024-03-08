import { ValidateObjectIdPipe } from '@/dto/validators/mongoId.decorator';
import { ROLE } from '@/types/enums';
import { pick } from '@/utils/object.util';
import { JwtAuthGuard } from '@classes/jwt-auth.guard';
import { RolesGuard } from '@classes/role.guard';
import { CurrentUser } from '@decorators/current-user.decorator';
import { Roles } from '@decorators/role.decorator';
import { IUserDocument } from '@interfaces/entities';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FilterQuery, Types } from 'mongoose';
import { GetUserDto } from './dto/getUser.dto';
import { UpdateUserAdminDto, UpdateUserStatusDto } from './dto/updateUser.dto';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(@Query() query: GetUserDto) {
    const filter: FilterQuery<IUserDocument> = pick(query, [
      'id',
      'email',
      'name',
      'phone',
      'status',
    ]);
    const options = pick(query, ['page', 'limit', 'sort', 'pagination']);

    if (filter.id) {
      filter._id = new Types.ObjectId(filter.id);
      delete filter.id;
    }

    if (filter.email) {
      filter.email = { $regex: filter.email, $options: 'i' };
    }

    if (filter.name) {
      filter.name = { $regex: filter.name, $options: 'i' };
    }

    if (filter.phone) {
      filter.phone = { $regex: filter.phone, $options: 'i' };
    }

    const users = await this.userService.getUsers(filter, options);
    return users;
  }

  @Roles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/:userId')
  async findOne(@Param('userId', ValidateObjectIdPipe) userId: string) {
    const user = await this.userService.getUserById(userId);
    return user;
  }

  @Roles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/:userId')
  async updateOne(
    @Param('userId', ValidateObjectIdPipe) userId: string,
    @Body() body: UpdateUserAdminDto,
  ) {
    const user = await this.userService.updateUserById(userId, body);
    return user;
  }

  @Roles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/:userId/status')
  async updateStatus(
    @Param('userId', ValidateObjectIdPipe) userId: string,
    @Body() body: UpdateUserStatusDto,
  ) {
    const user = await this.userService.updateUserStatusById(
      userId,
      body.status,
    );
    return user;
  }

  @Roles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/:userId')
  async deleteUser(
    @Param('userId', ValidateObjectIdPipe) userId: string,
    @CurrentUser() admin: IUserDocument,
  ): Promise<IUserDocument> {
    const user = await this.userService.deleteUserById(userId, admin.id);
    return user;
  }
}
