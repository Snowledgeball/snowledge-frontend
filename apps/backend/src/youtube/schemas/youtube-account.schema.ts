import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';


export type YouTubeAccountDocument = YouTubeAccount & Document;
@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class YouTubeAccount {
	@Transform(({ value }) => value.toString())
	_id: ObjectId;

	@Prop()
	name: string;

	@Prop()
	handle: string;

	@Prop()
	url: string;
}
export const YouTubeAccountSchema = SchemaFactory.createForClass(YouTubeAccount);