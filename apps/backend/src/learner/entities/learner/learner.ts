import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../user/entities/user.entity';
import { Community } from '../../../community/entities/community.entity';

@Entity()
export class Learner {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.learners, { eager: true })
	user: User;

	@ManyToOne(() => Community, (community) => community.learners, {
		eager: true,
	})
	community: Community;

	@Column({ default: false })
	isContributor: boolean;

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
