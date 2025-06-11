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

	@Prop({ enum: ['pending', 'running', 'completed', 'failed'], required: true })
	status: string;

	@Prop({ type: Object })
	metadata?: Record<string, any>;
}
export const DiscordHarvestJobSchema = SchemaFactory.createForClass(DiscordHarvestJob);