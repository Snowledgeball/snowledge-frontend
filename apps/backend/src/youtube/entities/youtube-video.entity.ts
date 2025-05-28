import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { YouTubeChannel } from "./youtube-channel.entity";
import { YouTubeComment } from "./youtube-comment.entity";
import { AnalysisResult } from "src/analysis/entities/analysis-result.entity";

@Entity()
export class YouTubeVideo {
	@PrimaryGeneratedColumn()
	id: string;

	@ManyToOne(() => YouTubeChannel, (channel) => channel.videos, { cascade: true })
	channel: YouTubeChannel;

	@ManyToOne(() => AnalysisResult, (analysis) => analysis.scopeVideos, { cascade: true })
	analysis: AnalysisResult;
	
	@Column()
	title: string;

	@Column({ unique: true })
	url: string;

	@Column()
	publishedAt: Date;

	@OneToMany(() => YouTubeComment, (comment) => comment.video)
	comments: YouTubeComment[];

	@CreateDateColumn({
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP(6)',
	})
	created_at: Date;

	@UpdateDateColumn({
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP(6)',
		onUpdate: 'CURRENT_TIMESTAMP(6)',
	})
	updated_at: Date;
}