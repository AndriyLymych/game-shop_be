import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (metadata?.type === 'custom') {
      return value;
    }

    const objectToValidate = plainToClass(metadata?.metatype, value);

    const errors = await validate(objectToValidate);

    if (errors?.length) {
      const errorMessage = errors.reduce((acc, nextValue) => {
        acc[nextValue?.property] = nextValue?.constraints;

        return acc;
      }, {});

      throw new BadRequestException(JSON.stringify(errorMessage));
    }

    return value;
  }
}
