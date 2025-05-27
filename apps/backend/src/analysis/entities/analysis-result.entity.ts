import { DiscordChannel } from "src/discord/entities/discord-channel.entity";
import { Platform } from "src/platform/entities/platform.entity";
import { User } from "src/user/entities/user.entity";
import { YouTubeVideo } from "src/youtube/entities/youtube-video.entity";
import { Entity, Index, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";

@Entity('analysis_result')
@Index(['user', 'created_at'])
@Index(['resultJson'], { fulltext: false })
export class AnalysisResult {
	@PrimaryGeneratedColumn()
	id: string;

	@ManyToOne(() => User, (user) => user.analysis, { cascade: true })
	user: User;

	@ManyToOne(() => Platform, (platform) => platform.analysis, { cascade: true })
	platform: Platform;

	@Column()
	promptKey: string;

	@Column()
	llmModel: string;

	
	@OneToMany(() => DiscordChannel, (channel) => channel.analysis, { nullable: true})
	scopeChannels: DiscordChannel[];

	@OneToMany(() => YouTubeVideo, (video) => video.analysis, { nullable: true})
	scopeVideos: YouTubeVideo[];

	@Column({ nullable: true })
	periodFrom: Date;

	@Column({ nullable: true })
	periodTo: Date;

	@Column({ type: 'jsonb' })
	resultJson: object;

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
