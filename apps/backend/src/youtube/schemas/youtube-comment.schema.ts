import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';

export type YouTubeCommentDocument = YouTubeComment & Document;
@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class YouTubeComment {
	@Transform(({ value }) => value.toString())
	_id: ObjectId;

	@Prop()
	video_id: any;

	@Prop()
	parent_comment_id?: any;

	@Prop()
	author_user_id: string;

	@Prop()
	content?: string;

	@Prop()
	fetched_at?: Date;
}
export const YouTubeCommentSchema = SchemaFactory.createForClass(YouTubeComment);