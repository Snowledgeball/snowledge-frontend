import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
} from 'typeorm';
import { Community } from '../../community/entities/community.entity';
import { User } from '../../user/entities/user.entity';
import { Vote } from '../../vote/entities/vote.entity';
import { Expose } from 'class-transformer';

@Entity('proposals')
export class Proposal {
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

	@Column({ default: 'in_progress' })
	status: 'in_progress' | 'accepted' | 'rejected';

	@Column({ type: 'timestamptz', nullable: true })
	endedAt: Date;

	@ManyToOne(() => Community, (community) => community.proposals, {
		cascade: false,
		nullable: false,
	})
	community: Community;

	@ManyToOne(() => User, (user) => user.communities, {
		cascade: false,
		nullable: false,
	})
	submitter: User;

	@OneToMany(() => Vote, (vote) => vote.proposal)
	votes: Vote[];

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;

	@Expose()
	get deadline() {
		return new Date(this.createdAt.getTime() + 5 * 24 * 60 * 60 * 1000); // TODO: make it dynamic, 5 days by default
	}

	@Expose()
	get quorum() {
		const learners = this.community?.learners ?? [];
		const required = Math.ceil(learners.length / 2);
		const current = this.votes ? this.votes.length : 0;
		return { current, required };
	}

	@Expose()
	get progress() {
		const required = this.quorum.required;
		const current = this.votes ? this.votes.length : 0;
		return Math.round((current / required) * 100) || 0;
	}

	@Expose()
	get reason() {
		return this.endedAt > this.deadline ? 'by_expiration' : 'by_vote';
	}
}
