import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	OneToMany,
	CreateDateColumn,
	UpdateDateColumn,
	BeforeInsert,
	JoinColumn,
	OneToOne,
} from 'typeorm';

import { randomUUID } from 'node:crypto';
import { Gender } from 'src/shared/enums/Gender';
import { Email } from 'src/email/entities/email.entity';
import { Community } from 'src/community/entities/community.entity';
import { DiscordServer } from 'src/discord/entities/discord-server.entity';
import { YouTubeChannel } from 'src/youtube/entities/youtube-channel.entity';
import { AnalysisResult } from 'src/analysis/entities/analysis-result.entity';
import { DiscordAccess } from 'src/discord/entities/discord-access.entity';
import { Type } from 'class-transformer';
import { Learner } from '../../learner/entities/learner/learner';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true, unique: true })
	email: string;

	@Column()
	firstname: string;

	@Column()
	lastname: string;

	@Column()
	pseudo: string;

	@Column({
		type: 'enum',
		enum: Gender,
	})
	gender: Gender;

	@Column({
		type: 'timestamp',
	})
	age: Date;

	@Column()
	password: string;

	@Column({ default: false })
	isActive: boolean;

	@Column({ nullable: true, unique: true })
	discordId: string;

	@Column({ nullable: true, unique: true })
	youtubeId: string;

	@Column({ nullable: true })
	referrer: string;

	@Column({ unique: true })
	referral: string;

	@OneToOne(() => DiscordAccess)
	@JoinColumn()
	@Type(() => DiscordAccess)
	discordAccess?: DiscordAccess;

	@OneToMany(() => Email, (email) => email.user)
	emails: Email[];

	@OneToMany(() => Community, (community) => community.user)
	communities: Community[];

	@OneToMany(() => DiscordServer, (discordServer) => discordServer.user)
	discords: DiscordServer[];

	@OneToMany(() => YouTubeChannel, (youTubeChannel) => youTubeChannel.user)
	youtubes: YouTubeChannel[];

	@OneToMany(() => AnalysisResult, (analysis) => analysis.user)
	analysis: AnalysisResult[];

	@Column({ nullable: true })
	refreshToken: string;

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

	@OneToMany(() => Learner, (learner) => learner.user)
	learners: Learner[];

	@BeforeInsert()
	lowercase() {
		this.isActive = Boolean(false);
		this.referral = randomUUID().replace(/-g/, '').slice(0, 8);
	}
}
