import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class UserValidationPipe implements PipeTransform {
  transform(value: any) {
    if (!value?.name || typeof value.name !== 'string') {
      throw new BadRequestException(
        'Le champ "name" est requis et doit être une chaîne',
      );
    }
    return value;
  }
}
