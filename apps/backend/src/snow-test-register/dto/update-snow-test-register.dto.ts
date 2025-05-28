import { PartialType } from '@nestjs/swagger';
import { CreateSnowTestRegisterDto } from './create-snow-test-register.dto';

export class UpdateSnowTestRegisterDto extends PartialType(CreateSnowTestRegisterDto) {}
