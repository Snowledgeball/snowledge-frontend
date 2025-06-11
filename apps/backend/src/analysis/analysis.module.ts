import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { AnalysisResult, AnalysisResultSchema } from './schemas/analysis-result.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
	imports: [MongooseModule.forFeature([{ name: AnalysisResult.name, schema: AnalysisResultSchema }])],
	controllers: [AnalysisController],
	providers: [AnalysisService],
})
export class AnalysisModule {}
