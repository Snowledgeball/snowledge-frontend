import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';


export type YouTubeChannelDocument = YouTubeChannel & Document;
@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class YouTubeChannel {
	@Transform(({ value }) => value.toString())
	_id: ObjectId;

	@Prop({ type: Number, required: true })
	user_id: number;

	@Prop({ required: true, match: /^@.+/ })
	handle: string;
}
export const YouTubeChannelSchema = SchemaFactory.createForClass(YouTubeChannel);