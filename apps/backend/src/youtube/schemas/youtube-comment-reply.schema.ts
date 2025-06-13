import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';

export type YouTubeCommentReplyDocument = YouTubeCommentReply & Document;
@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class YouTubeCommentReply {
	@Transform(({ value }) => value.toString())
	_id: ObjectId;

	@Prop()
	author_user_id: string;

	@Prop()
	content?: string;
}
export const YouTubeCommentReplySchema = SchemaFactory.createForClass(YouTubeCommentReply);