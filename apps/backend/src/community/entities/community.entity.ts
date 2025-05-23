import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

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
}
