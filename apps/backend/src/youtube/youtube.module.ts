import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YouTubeChannel } from './entities/youtube-channel.entity';
import { YouTubeComment } from './entities/youtube-comment.entity';
import { YouTubeVideo } from './entities/youtube-video.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            YouTubeChannel,
            YouTubeVideo,
            YouTubeComment,
        ]),
    ]
})
export class YoutubeModule {}
