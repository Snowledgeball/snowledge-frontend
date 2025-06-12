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

export enum LearnerStatus {
	INVITED = 'invited',
	MEMBER = 'member',
	BANNED = 'banned',
	INVITATION_REJECTED = 'invitation_rejected',
}

@Entity()
export class Learner {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.learners, {
		eager: true,
		onDelete: 'CASCADE',
	})
	user: User;

	@ManyToOne(() => Community, (community) => community.learners, {
		eager: true,
	})
	community: Community;

	@Column({ default: false })
	isContributor: boolean;

	@Column({
		type: 'enum',
		enum: LearnerStatus,
		default: LearnerStatus.MEMBER,
	})
	status: LearnerStatus;

	@Column({ nullable: true })
	invitedAt: Date;

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
