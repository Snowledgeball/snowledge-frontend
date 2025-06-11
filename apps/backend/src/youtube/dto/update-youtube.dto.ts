import { PartialType } from '@nestjs/swagger';
import { CreateYoutubeDto } from './create-youtube.dto';

export class UpdateYoutubeDto extends PartialType(CreateYoutubeDto) {}
