import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';

export type DiscordServerDocument = DiscordServer & Document;
@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class DiscordServer {
	@Transform(({ value }) => value.toString())
	_id: ObjectId;

	@Prop({ required: true })
	name: string;

	@Prop()
	creator_id?: string;

	@Prop()
	platform_id?: number;
}
export const DiscordServerSchema = SchemaFactory.createForClass(DiscordServer);