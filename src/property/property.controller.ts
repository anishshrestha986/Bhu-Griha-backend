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
  Query,
  InternalServerErrorException,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { PropertyService } from './property.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, FilterQuery, PaginateOptions, Types } from 'mongoose';
import { UserCreatePropertyDto } from './dto/createProperty.dto';
import { JwtAuthGuard } from '@classes/jwt-auth.guard';
import { NotFoundException } from '@nestjs/common';
import { UpdatePropertyDto } from './dto/updateProperty.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ValidateObjectIdPipe } from '@dto/validators/mongoId.decorator';
import { RolesGuard } from '@classes/role.guard';
import { Roles } from '@decorators/role.decorator';
import { ROLE } from '@/types/enums';
import { GetPropertyDto } from './dto/getProperty.dto';
import { IPropertyDocument } from '@interfaces/entities';
import { pick } from '@utils/object.util';
import {
  CurrentRequestUser,
  CurrentUser,
} from '@decorators/current-user.decorator';

@ApiTags('Property')
@Controller('property')
export class PropertyController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private propertyService: PropertyService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllPropertys(@Query() query: GetPropertyDto) {
    const filter: FilterQuery<IPropertyDocument> = pick(query, [
      'id',
      'location',
      'name',
      'description',
      'isVerified',
      'status',
      'type',
      'postedOn',
    ]);

    const options: PaginateOptions = pick(query, [
      'limit',
      'page',
      'sort',
      'pagination',
    ]);

    if (filter.id) {
      filter._id = new Types.ObjectId(filter.id);

      delete filter.id;
    }

    if (filter.q) {
      filter.name = { $regex: filter.q, $options: 'i' };

      delete filter.q;
    }

    if (filter.name) {
      filter.name = { $regex: filter.name, $options: 'i' };
    }

    if (filter.location) {
      filter.location = { $regex: filter.location, $options: 'i' };
    }

    if (filter.postedOn) {
      filter.postedOn = Object.assign(filter.postedOn ?? {}, {
        $gte: filter.postedOn,
      });

      delete filter.postedOn;
    }

    if (filter.description) {
      filter.country = { $regex: filter.description, $options: 'i' };
    }

    return this.propertyService.getAllProperties(filter, options);
  }
  @Roles(ROLE.ADMIN, ROLE.USER)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/')
  async createProperty(
    @Body() createPropertyDto: UserCreatePropertyDto,
    @Res() res: Response,
    @CurrentUser() user: CurrentRequestUser,
  ) {
    const session = await this.mongoConnection.startSession();
    const postedOn = new Date().toUTCString();
    session.startTransaction();
    try {
      const newProperty: any = await this.propertyService.createProperty(
        { ...createPropertyDto, postedBy: user.id, postedOn },
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
  @Roles(ROLE.USER)
  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  async updateProperty(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Res() res: Response,
    @CurrentUser() user: CurrentRequestUser,
  ) {
    const property = await this.propertyService.getPropertyById(id);
    if (!property) throw new NotFoundException('Property not found');
    if (property.postedBy.toString() !== user.id)
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
  @Roles(ROLE.USER)
  @UseGuards(JwtAuthGuard)
  @Patch('/admin/:id')
  async updatePropertyAdmin(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Res() res: Response,
  ) {
    const property = await this.propertyService.getPropertyById(id);
    if (!property) throw new NotFoundException('Property not found');
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/:id')
  async deletedProperty(@Param('id', ValidateObjectIdPipe) id: string) {
    const property = await this.propertyService.getPropertyById(id);
    if (!property) throw new NotFoundException('Property not found');
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      await this.propertyService.deleteProperty(id, session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      session.endSession();
    }
  }

  @ApiBearerAuth()
  @Roles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/:id/resolve')
  async verifyProperty(@Param('id', ValidateObjectIdPipe) id: string) {
    const property = await this.propertyService.getPropertyById(id);
    if (!property) throw new NotFoundException('Property not found');

    property.isVerified = true;
    await property.save();
    return property;
  }
}
