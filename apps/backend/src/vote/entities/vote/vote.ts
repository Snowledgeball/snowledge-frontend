import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

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

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
