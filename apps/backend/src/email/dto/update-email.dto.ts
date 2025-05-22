import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEmailDto } from './create-email.dto';
import { IsBoolean } from 'class-validator';

export class UpdateEmailDto extends PartialType(CreateEmailDto) {
	@IsBoolean()
	@ApiProperty({ type: Boolean })
	used: boolean;
}
