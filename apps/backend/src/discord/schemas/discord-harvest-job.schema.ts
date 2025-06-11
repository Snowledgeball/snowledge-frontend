import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, ObjectId } from 'mongoose';

export type DiscordHarvestJobDocument = DiscordHarvestJob & Document;
@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class DiscordHarvestJob {
	@Transform(({ value }) => value.toString())
	_id: ObjectId;
	@Prop({ required: true })
	discordId: string;

	@Prop({ type: Number, required: true })
	serverId: number;

	@Prop({ type: [Number], required: true })
	channels: number[];

	@Prop()
	after?: string;

	@Prop()
	before?: string;

	@Prop({ enum: ['pending', 'running', 'completed', 'failed'], required: true })
	status: string;

	@Prop()
	finished_at?: Date;

	@Prop()
	inserted?: number;

	@Prop()
	error?: string;
}
export const DiscordHarvestJobSchema = SchemaFactory.createForClass(DiscordHarvestJob);