import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import mongoose, { Document, ObjectId, Types } from 'mongoose';

export type AnalysisResultDocument = AnalysisResult & Document;
@Schema({
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
	toJSON: { virtuals: true },
})
export class AnalysisResult {
	@Transform(({ value }) => value.toString())
	_id: ObjectId;	
	
	@Prop({ type: Number, required: true })
	creator_id: number;

	@Prop({ required: true })
	platform: string;

	@Prop({ required: true })
	prompt_key: string;

	@Prop()
	llm_model?: string;

	@Prop({ type: Object })
	scope?: Record<string, any>;

	@Prop({ type: Object })
	period?: Record<string, any>;

	@Prop({ required: true, type: Object })
	result: Record<string, any>;

	@Prop({ required: true })
	created_at: Date;
}
export const AnalysisResultSchema = SchemaFactory.createForClass(AnalysisResult);