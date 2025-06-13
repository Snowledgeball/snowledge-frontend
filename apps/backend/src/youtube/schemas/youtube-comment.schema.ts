import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import mongoose, { Document, ObjectId, Types } from 'mongoose';
import { YouTubeVideo } from './youtube-video.schema';
import { YouTubeCommentReply, YouTubeCommentReplySchema } from './youtube-comment-reply.schema';

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

	@Prop({ type: Number, required: true })
	user_id: number;

	@Prop()
	parent_comment_id?: string;

	@Prop()
	content?: string;

	@Prop()
	fetched_at?: Date;

	@Prop([YouTubeCommentReplySchema])
	replies?: YouTubeCommentReply[];
}
export const YouTubeCommentSchema = SchemaFactory.createForClass(YouTubeComment);

export type YouTubeCommentDocumentOverride = {
  replies: Types.DocumentArray<YouTubeCommentReply>;
};
