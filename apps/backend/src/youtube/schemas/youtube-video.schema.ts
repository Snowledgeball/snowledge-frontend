import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import mongoose, { Document, ObjectId } from 'mongoose';
import { YouTubeChannel } from './youtube-channel.schema';

export type YouTubeVideoDocument = YouTubeVideo & Document;
@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class YouTubeVideo {
	@Transform(({ value }) => value.toString())
	_id: ObjectId;	
	
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'YouTubeChannel' })
	channel_id: YouTubeChannel;

	@Prop({ required: true })
	title: string;

	@Prop({ required: true })
	published_at: Date;
}
export const YouTubeVideoSchema = SchemaFactory.createForClass(YouTubeVideo);