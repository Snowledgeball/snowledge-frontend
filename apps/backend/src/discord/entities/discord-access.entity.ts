import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity()
export class DiscordAccess {
	@PrimaryGeneratedColumn()
	id: string;

	@Column()
	accessToken: string;

	@Column()
	tokenType: string;

	@Column()
	expiresIn: number;

	@Column()
	refreshToken: string;

	@Column()
	scope: string;

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
