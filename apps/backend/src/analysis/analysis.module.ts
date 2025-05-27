import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisResult } from './entities/analysis-result.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AnalysisResult]),
    ]
})
export class AnalysisModule {}
