import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { DiscordServer } from "./discord-server.entity";
import { DiscordMessage } from "./discord-message.entity";
import { AnalysisResult } from "src/analysis/entities/analysis-result.entity";

@Entity()
	export class DiscordChannel {
	@PrimaryGeneratedColumn()
	id: string;

	@OneToMany(() => DiscordMessage, (channel) => channel.channel)
	messages: DiscordMessage[];

	@ManyToOne(() => DiscordServer, (server) => server.channels, { cascade: true })
	server: DiscordServer;

	@ManyToOne(() => AnalysisResult, (analysis) => analysis.scopeChannels, { cascade: true })
	analysis: AnalysisResult;

	@Column()
	name: string;

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