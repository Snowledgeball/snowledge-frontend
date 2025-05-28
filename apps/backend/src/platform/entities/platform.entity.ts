import { AnalysisResult } from "src/analysis/entities/analysis-result.entity";
import { DiscordServer } from "src/discord/entities/discord-server.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";

@Entity()
export class Platform {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	name: string;

	@Column({ nullable: true })
	description: string;

	@Column({ nullable: true })
	apiUrl: string;

	@OneToMany(() => DiscordServer, (discordServer) => discordServer.platform)
	discords: DiscordServer[];

	@OneToMany(() => AnalysisResult, (analysis) => analysis.platform)
	analysis: AnalysisResult[];
	
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