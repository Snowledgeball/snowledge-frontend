import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
} from 'typeorm';
import { Community } from '../../../community/entities/community.entity';
import { User } from '../../../user/entities/user.entity';
import { Vote } from '../../../vote/entities/vote/vote.entity';
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

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

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
	get endDate(): Date {
		const end = new Date(this.createdAt);
		end.setDate(end.getDate() + 5);
		return end;
	}
}
