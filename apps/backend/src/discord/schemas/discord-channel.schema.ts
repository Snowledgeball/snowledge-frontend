import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';

export type DiscordChannelDocument = DiscordChannel & Document;
@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class DiscordChannel {
	@Transform(({ value }) => value.toString())
	_id: ObjectId;

	@Prop({ required: true })
	name: string;

	@Prop({ type: Number, required: true })
	server_id: number;
}
export const DiscordChannelSchema = SchemaFactory.createForClass(DiscordChannel);