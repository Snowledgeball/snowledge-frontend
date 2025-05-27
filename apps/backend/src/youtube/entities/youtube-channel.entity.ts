import { User } from "src/user/entities/user.entity";
import { Entity, Index, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { YouTubeVideo } from "./youtube-video.entity";

@Entity()
@Index(['user'])
export class YouTubeChannel {
	@PrimaryGeneratedColumn()
	id: string;

	@ManyToOne(() => User, (user) => user.youtubes, { cascade: true })
	user: User;

	@Column()
	name: string;

	@Column({ unique: true })
	handle: string;

	@Column({ unique: true })
	url: string;

	@OneToMany(() => YouTubeVideo, (youTubeVideo) => youTubeVideo.channel)
	videos: YouTubeVideo[];

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