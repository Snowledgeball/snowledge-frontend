import { Injectable } from '@nestjs/common';
import { CreateYoutubeDto } from './dto/create-youtube.dto';
import { UpdateYoutubeDto } from './dto/update-youtube.dto';

@Injectable()
export class YoutubeService {
  create(createYoutubeDto: CreateYoutubeDto) {
    return 'This action adds a new youtube';
  }

  findAll() {
    return `This action returns all youtube`;
  }

  findOne(id: number) {
    return `This action returns a #${id} youtube`;
  }

  update(id: number, updateYoutubeDto: UpdateYoutubeDto) {
    return `This action updates a #${id} youtube`;
  }

  remove(id: number) {
    return `This action removes a #${id} youtube`;
  }
}
