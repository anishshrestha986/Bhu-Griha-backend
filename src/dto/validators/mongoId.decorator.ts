import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';
import { isValidObjectId } from 'mongoose';

export const IS_VALID_OBJECT_ID = 'isValidObjectId';
export const IS_VALID_OBJECT_ID_ARRAY = 'isValidObjectIdArray';

export function IsValidObjectId(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol) {
    ValidateBy(
      {
        name: IS_VALID_OBJECT_ID,
        validator: {
          validate: (value): boolean => isValidObjectId(value),
          defaultMessage: buildMessage(
            (eachPrefix) => eachPrefix + '$property must be a valid mongo id',
            validationOptions,
          ),
        },
      },
      validationOptions,
    )(target, propertyKey);

    ApiProperty({ description: 'MongoId' })(target, propertyKey);
  };
}

export function IsValidObjectIdArray(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol) {
    ValidateBy(
      {
        name: IS_VALID_OBJECT_ID_ARRAY,
        validator: {
          validate: (value): boolean =>
            Array.isArray(value) && value.every(isValidObjectId),
          defaultMessage: buildMessage(
            (eachPrefix) => eachPrefix + '$property must be a valid mongo id',
            validationOptions,
          ),
        },
      },
      validationOptions,
    )(target, propertyKey);

    ApiProperty({ description: 'Array of Valid MongoId' })(target, propertyKey);
  };
}

import {
  PipeTransform,
  Injectable,
  Optional,
  HttpStatus,
} from '@nestjs/common';
import {
  ErrorHttpStatusCode,
  HttpErrorByCode,
} from '@nestjs/common/utils/http-error-by-code.util';
import { ApiProperty } from '@nestjs/swagger';

export interface ValidateObjectIdPipeOptions {
  errorHttpStatusCode?: ErrorHttpStatusCode;
  exceptionFactory?: (error: string) => any;
  optional?: boolean;
}

@Injectable()
export class ValidateObjectIdPipe implements PipeTransform<string> {
  protected exceptionFactory: (error: string) => any;

  constructor(
    @Optional() protected readonly options?: ValidateObjectIdPipeOptions,
  ) {
    options = options || {};
    const { exceptionFactory, errorHttpStatusCode = HttpStatus.BAD_REQUEST } =
      options;

    this.exceptionFactory =
      exceptionFactory ||
      ((error) => new HttpErrorByCode[errorHttpStatusCode](error));
  }

  async transform(value: string) {
    if (this.options?.optional && !value) {
      return value;
    }

    if (!isValidObjectId(value)) {
      throw this.exceptionFactory(
        'Validation failed (valid mongo id expected)',
      );
    }
    return value;
  }
}
