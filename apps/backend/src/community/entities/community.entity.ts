import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Community {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 100 })
	name: string;

	@Column({ nullable: true })
	tags?: string;

	@Column()
	isFree: boolean;

	@Column({ nullable: true })
	price?: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ nullable: true })
	externalLinks?: string;

	@ManyToOne(() => User, (user) => user.communities, {
		cascade: false,
		nullable: false,
	})
	user: User;
}
