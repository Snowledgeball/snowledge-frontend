import { Platform } from "src/platform/entities/platform.entity";
import { User } from "src/user/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { DiscordChannel } from "./discord-channel.entity";

@Entity()
export class DiscordServer {
	@PrimaryGeneratedColumn()
	id: string;
	
	@Column()
	name: string;
	
	@OneToMany(() => DiscordChannel, (channel) => channel.server)
	channels: DiscordChannel[];

	@ManyToOne(() => User, (user) => user.discords, { cascade: true })
	user: User;

	@ManyToOne(() => Platform, (platform) => platform.discords, { cascade: true })
	platform: Platform;

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