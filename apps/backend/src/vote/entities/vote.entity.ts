import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Proposal } from '../../proposal/entities/proposal/proposal.entity';
import { User } from '../../user/entities/user.entity';

@Entity('votes')
export class Vote {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Proposal, (proposal) => proposal.votes, {
		nullable: false,
	})
	proposal: Proposal;

	@ManyToOne(() => User, (user) => user.votes, { nullable: false })
	user: User;

	@Column({ length: 20 })
	choice: string; // "for" | "against"

	@Column({ length: 400, nullable: true })
	comment?: string;

	@Column({ length: 20, nullable: true })
	formatChoice?: string; // "for" | "against"

	@Column({ length: 400, nullable: true })
	formatComment?: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
