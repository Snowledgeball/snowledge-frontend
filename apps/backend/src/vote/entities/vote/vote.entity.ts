import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
} from 'typeorm';
import { Community } from '../../../community/entities/community.entity';
import { User } from '../../../user/entities/user.entity';

@Entity('votes')
export class Vote {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 80 })
	title: string;

	@Column({ length: 200 })
	description: string;

	@Column({ length: 40, nullable: true })
	format?: string;

	@Column({ length: 400, nullable: true })
	comments?: string;

	@Column({ default: false, nullable: true })
	isContributor?: boolean;

	@ManyToOne(() => Community, (community) => community.votes, {
		cascade: false,
		nullable: false,
	})
	community: Community;

	@ManyToOne(() => User, (user) => user.communities, {
		cascade: false,
		nullable: false,
	})
	submitter: User;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
