import { Entity, Index, PrimaryGeneratedColumn, ManyToOne, Column, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { YouTubeVideo } from "./youtube-video.entity";

@Entity()
@Index(['video', 'created_at'])
@Index(['fetchedAt'])
@Index(['parentCommentId'])
export class YouTubeComment {
	@PrimaryGeneratedColumn()
	id: string;

	@ManyToOne(() => YouTubeVideo, (video) => video.comments, { cascade: true })
	video: YouTubeVideo;

	@Column({ nullable: true })
	parentCommentId: string;

	@Column()
	authorId: string;

	@Column({ nullable: true })
	content: string;

	@Column({
		type: 'timestamp',
	})
	fetchedAt: Date;
	
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