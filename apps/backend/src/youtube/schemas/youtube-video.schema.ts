import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';

export type YouTubeVideoDocument = YouTubeVideo & Document;
@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class YouTubeVideo {
	@Transform(({ value }) => value.toString())
	_id: ObjectId;	
	
	@Prop()
	title: string;

	@Prop()
	url: string;

	@Prop()
	account_id?: string;

	@Prop()
	published_at?: Date;
}
export const YouTubeVideoSchema = SchemaFactory.createForClass(YouTubeVideo);