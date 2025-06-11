import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import mongoose, { Document, ObjectId } from 'mongoose';
import { YouTubeVideo } from './youtube-video.schema';

export type YouTubeCommentDocument = YouTubeComment & Document;
@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class YouTubeComment {
	@Transform(({ value }) => value.toString())
	_id: ObjectId;

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'YoutubeVideo' })
	video_id: YouTubeVideo;

	@Prop()
	parent_comment_id?: string;

	@Prop()
	author_user_id: string;

	@Prop()
	content?: string;

	@Prop()
	fetched_at?: Date;
}
export const YouTubeCommentSchema = SchemaFactory.createForClass(YouTubeComment);