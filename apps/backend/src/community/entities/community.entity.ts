import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	OneToMany,
	UpdateDateColumn,
	CreateDateColumn,
	OneToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Learner } from '../../learner/entities/learner/learner';
import { Proposal } from '../../proposal/entities/proposal.entity';
import { DiscordServer } from '../../discord-server/entities/discord-server-entity';

@Entity()
export class Community {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	slug: string;

	@Column({ length: 100 })
	name: string;

	@Column({ type: 'json' })
	tags: string[];

	@Column()
	communityType: 'free' | 'paid';

	@Column({ type: 'float', nullable: true })
	price?: number;

	@Column({ type: 'float', nullable: true })
	yourPercentage?: number;

	@Column({ type: 'float', nullable: true })
	communityPercentage?: number;

	@Column()
	description: string;

	@Column()
	codeOfConduct: string;

	@ManyToOne(() => User, (user) => user.communities, {
		cascade: false,
		nullable: false,
	})
	user: User;

	@OneToMany(() => Learner, (learner) => learner.community)
	learners: Learner[];

	@OneToMany(() => Proposal, (proposal) => proposal.community)
	proposals: Proposal[];

	@OneToOne(() => DiscordServer, (discordServer) => discordServer.community)
	discordServer: DiscordServer;

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
