import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class UserValidationPipe implements PipeTransform {
  transform(value: any) {
    if (
      !value?.name ||
      typeof value.name !== 'string' ||
      value.name.length < 3
    ) {
      throw new BadRequestException(
        'Le champ "name" est requis et doit être une chaîne de caractères et contenir au moins 3 caractères',
      );
    }
    return value;
  }
}
