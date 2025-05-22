import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEmailDto } from './create-email.dto';
import { IsEmail, IsNumber } from 'class-validator';

export class CreateCodeEmailDto extends PartialType(CreateEmailDto) {
	@IsNumber()
	@ApiProperty({ type: Number })
	code?: number;

	@ApiProperty({
		type: String,
	})
	@IsEmail()
	email: string;
}
