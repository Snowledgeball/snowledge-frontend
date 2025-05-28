import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EmailType } from 'src/shared/enums/EmailType';

export class CreateEmailDto {
	@IsEnum(EmailType)
	@ApiProperty({ enum: EmailType })
	emailType: EmailType;
}
