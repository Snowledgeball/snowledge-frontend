import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';

export type DiscordMessageDocument = DiscordMessage & Document;
@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class DiscordMessage {
	@Transform(({ value }) => value.toString())
	_id: ObjectId;

	@Prop({ type: Number, required: true })
	user_id: number;

	@Prop()
	content?: string;

	@Prop({ type: Number, required: true })
	channel_id: number;

	@Prop({ type: Number })
	parent_message_id?: number;

	@Prop()
	fetched_at?: Date;
}
export const DiscordMessageSchema = SchemaFactory.createForClass(DiscordMessage);