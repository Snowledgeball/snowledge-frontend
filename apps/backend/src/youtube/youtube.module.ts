import { Module } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { YoutubeController } from './youtube.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { YouTubeComment, YouTubeCommentSchema } from './schemas/youtube-comment.schema';
import { YouTubeAccount, YouTubeAccountSchema } from './schemas/youtube-account.schema';
import { YouTubeVideo, YouTubeVideoSchema } from './schemas/youtube-video.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: YouTubeAccount.name, schema: YouTubeAccountSchema },
			{ name: YouTubeComment.name, schema: YouTubeCommentSchema },
			{ name: YouTubeVideo.name, schema: YouTubeVideoSchema },
		])
	],
	controllers: [YoutubeController],
	providers: [YoutubeService],
})
export class YoutubeModule {}
