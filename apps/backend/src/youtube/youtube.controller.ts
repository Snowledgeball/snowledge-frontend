import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { CreateYoutubeDto } from './dto/create-youtube.dto';
import { UpdateYoutubeDto } from './dto/update-youtube.dto';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Post()
  create(@Body() createYoutubeDto: CreateYoutubeDto) {
    return this.youtubeService.create(createYoutubeDto);
  }

  @Get()
  findAll() {
    return this.youtubeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.youtubeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateYoutubeDto: UpdateYoutubeDto) {
    return this.youtubeService.update(+id, updateYoutubeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.youtubeService.remove(+id);
  }
}
