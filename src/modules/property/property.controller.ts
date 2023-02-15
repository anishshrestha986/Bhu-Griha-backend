import {
  Res,
  Controller,
  Post,
  UseGuards,
  Get,
  Body,
  Delete,
  Patch,
  Param,
  HttpStatus,
  Req,
  Query,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { PropertyService } from './property.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { UserCreatePropertyDto } from './dto/createProperty.dto';
import { JwtAuthGuard } from '@classes/jwt-auth.guard';
import { IRequest } from '@interfaces';
import { DEFAULT_PAGE, DEFAULT_SORT, LIMIT_PER_PAGE } from 'src/constants';
import { NotFoundException } from '@nestjs/common';
import { UpdatePropertyDto } from './dto/updateProperty.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetQueryDto } from '@dto/getQuery.dto';

@ApiTags('Property')
@Controller('propertys')
export class PropertyController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private propertyService: PropertyService,
  ) {}

  @Get('/')
  async getAllProperties(@Query() query: GetQueryDto) {
    const filter = {
      name: undefined,
    };
    const { limit, page, sort, q } = query;
    const options = {
      limit: limit ? limit : LIMIT_PER_PAGE,
      page: page ? page : DEFAULT_PAGE,
      sort: sort ? sort : DEFAULT_SORT,
      populate: {
        path: 'postedBy',
        select: 'firstName lastName',
      },
    };

    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    } else delete filter.name;

    if (options.sort) {
      options.sort = Object.fromEntries(
        options.sort.split(',').map((field) => field.split(':')),
      );
    }

    const properties = await this.propertyService.getAllProperties(
      filter,
      options,
    );
    return properties;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async createProperty(
    @Req() req: IRequest,
    @Body() createPropertyDto: UserCreatePropertyDto,
    @Res() res: Response,
  ) {
    const session = await this.mongoConnection.startSession();
    const postedOn = new Date().toUTCString();
    session.startTransaction();
    try {
      const newProperty: any = await this.propertyService.createProperty(
        { ...createPropertyDto, postedBy: req.user.id, postedOn },
        session,
      );
      await session.commitTransaction();
      return res.status(HttpStatus.CREATED).send(newProperty);
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      session.endSession();
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getUserProperties(@Req() req: IRequest, @Query() query: GetQueryDto) {
    const { limit, page, sort, q } = query;
    const options = {
      limit: limit ? limit : LIMIT_PER_PAGE,
      page: page ? page : DEFAULT_PAGE,
      sort: sort ? sort : DEFAULT_SORT,
      populate: {
        path: 'postedBy',
        select: 'firstName lastName',
      },
    };
    const filter = { name: undefined };
    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    } else delete filter.name;

    if (options.sort) {
      options.sort = Object.fromEntries(
        options.sort.split(',').map((field) => field.split(':')),
      );
    }

    const properties = await this.propertyService.getUserProperties(
      req.user.id,
      filter,
      options,
    );
    return properties;
  }

  @Get('/:id')
  async getPropertyById(@Param('id') id: string, @Res() res: Response) {
    const populate = {
      path: 'postedBy',
      select: 'firstName lastName',
    };

    const property: any = await this.propertyService.getPropertyById(
      id,
      populate,
    );
    if (!property) throw new NotFoundException('Property not found');
    return res.status(HttpStatus.OK).send(property);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  async updateProperty(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Res() res: Response,
    @Req() req: IRequest,
  ) {
    const property = await this.propertyService.getPropertyById(id);
    if (!property) throw new NotFoundException('Property not found');
    if (property.postedBy.toHexString() !== req.user.id)
      throw new UnauthorizedException('You can not update this property');
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const updatedproperty = await this.propertyService.updateProperty(
        id,
        { ...updatePropertyDto },
        session,
      );
      await session.commitTransaction();
      return res.status(HttpStatus.OK).send(updatedproperty);
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      session.endSession();
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deletedProperty(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: IRequest,
  ) {
    const property = await this.propertyService.getPropertyById(id);
    if (!property) throw new NotFoundException('Property not found');
    if (property.postedBy.toHexString() !== req.user.id)
      throw new UnauthorizedException('You can not delete this property');
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      await this.propertyService.deleteProperty(id, session);
      await session.commitTransaction();
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      session.endSession();
    }
  }
}
