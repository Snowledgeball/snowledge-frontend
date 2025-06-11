import { Module } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { YoutubeController } from './youtube.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { YouTubeComment, YouTubeCommentSchema } from './schemas/youtube-comment.schema';
import { YouTubeChannel, YouTubeChannelSchema } from './schemas/youtube-channel.schema';
import { YouTubeVideo, YouTubeVideoSchema } from './schemas/youtube-video.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: YouTubeChannel.name, schema: YouTubeChannelSchema },
			{ name: YouTubeComment.name, schema: YouTubeCommentSchema },
			{ name: YouTubeVideo.name, schema: YouTubeVideoSchema },
		])
	],
	controllers: [YoutubeController],
	providers: [YoutubeService],
})
export class YoutubeModule {}
