import {
  Controller,
  Post,
  UseInterceptors,
  Res,
  HttpStatus,
  Param,
  Get,
  UploadedFiles,
  UseGuards,
  Query,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MediaService } from './media.service';
import * as path from 'path';
import { Response } from 'express';
import { JwtAuthGuard } from '@classes/jwt-auth.guard';
import { NotFoundException } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdminMediaUploadDto, MediaUploadDto } from './dto/uploadMedia.dto';
import { PaginateQueryDto } from '@/dto/getQuery.dto';
import {
  CurrentRequestUser,
  CurrentUser,
} from '@decorators/current-user.decorator';
import { IMediaDocument } from '@interfaces/entities';
import { pick } from '@/utils/object.util';
import { FilterQuery, PaginateOptions } from 'mongoose';
import { RolesGuard } from '@classes/role.guard';
import { ROLE } from '@/types/enums';
import { Roles } from '@decorators/role.decorator';
import { ValidateObjectIdPipe } from '@/dto/validators/mongoId.decorator';
import { Public } from '@decorators/public-route.decorator';

@ApiTags('Media')
@Controller('medias')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Roles(ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: AdminMediaUploadDto, description: 'Media upload' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/admin')
  @UseInterceptors(FilesInterceptor('files[]', 5))
  async uploadFileByAdmin(
    @CurrentUser() user: CurrentRequestUser,
    @Res() res: Response,
    @Body() body: AdminMediaUploadDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files were uploaded');
    }

    const uploadedFiles = await this.mediaService.uploadBulkImagesToCloudinary(
      files,
    );

    const fileData = await this.mediaService.createBulk(
      uploadedFiles
        .map((file) => {
          if (file.status === 'fulfilled') {
            const data = file.value;
            return {
              filepath: data.secure_url,
              public_id: data.public_id,
              mimetype: data.mimetype,
              size: data.bytes,
              user: user.id,
              remark: body.remark,
              isPublic: body.isPublic,
            };
          }
        })
        .filter((file) => !!file),
    );

    if (!fileData || fileData.length === 0) {
      throw new BadRequestException('Failed to upload file');
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      data: fileData,
    });
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: MediaUploadDto, description: 'Media upload' })
  @UseGuards(JwtAuthGuard)
  @Post('/')
  @UseInterceptors(FilesInterceptor('files[]', 5))
  async uploadFileToClodinary(
    @CurrentUser() user: CurrentRequestUser,
    @Body() body: MediaUploadDto,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files were uploaded');
    }

    const uploadedFiles = await this.mediaService.uploadBulkImagesToCloudinary(
      files,
    );

    const fileData = await this.mediaService.createBulk(
      uploadedFiles
        .map((file) => {
          if (file.status === 'fulfilled') {
            const data = file.value;
            return {
              filepath: data.secure_url,
              public_id: data.public_id,
              mimetype: data.mimetype,
              size: data.bytes,
              user: user.id,
              isPublic: body.isPublic,
            };
          }
        })
        .filter((file) => !!file),
    );

    if (!fileData || fileData.length === 0) {
      throw new BadRequestException('Failed to upload file');
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      data: fileData,
    });
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: MediaUploadDto, description: 'Media upload' })
  @Post('/local')
  @UseInterceptors(
    FilesInterceptor('files[]', 5, {
      storage: diskStorage({
        destination: './storage',
        filename: (_, file, callBack) => {
          const fileName =
            path.parse(file.originalname).name.replace(/\s/g, '') + Date.now();
          const extension = path.parse(file.originalname).ext;
          callBack(null, `${fileName}${extension}`);
        },
      }),
    }),
  )
  async uploadFile(
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files were uploaded');
    }
    const fileData = await this.mediaService.createBulk(
      files.map((file) => {
        return {
          filepath: file.path,
          mimetype: file.mimetype,
          size: file.size,
        };
      }),
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      data: fileData,
    });
  }

  @ApiQuery({ name: 'access_token', type: String, required: false })
  @ApiBearerAuth()
  @Public()
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getMediaById(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Res() res: Response,
    @CurrentUser() user: CurrentRequestUser | null,
  ) {
    let media: IMediaDocument;
    if (!user) {
      media = await this.mediaService.getPublicMediaById(id);
    }
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.public_id) {
      return res.redirect(media.filepath);
    }

    const rootPath = process.cwd();
    return res
      .status(HttpStatus.OK)
      .sendFile(path.join(rootPath, media.filepath));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getUserMedias(
    @CurrentUser() user: CurrentRequestUser,
    @Query() query: PaginateQueryDto,
  ) {
    const filter: FilterQuery<IMediaDocument> = {};
    const options: PaginateOptions = pick(query, [
      'limit',
      'page',
      'sort',
      'pagination',
    ]);

    const medias = await this.mediaService.getUserMedias(
      user.id,
      filter,
      options,
    );
    return medias;
  }
}
