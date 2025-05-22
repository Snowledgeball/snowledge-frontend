import { OmitType } from '@nestjs/swagger';
import { SignUpDto } from '../../auth/dto';

export class UpdateUserDto extends OmitType(SignUpDto, [
	'email',
	'password',
] as const) {

}
