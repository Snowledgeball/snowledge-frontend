import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { EmailType } from 'src/shared/enums/EmailType';

@Entity()
export class Email {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: 'enum',
		enum: EmailType,
		default: EmailType.Code,
	})
	emailType: EmailType;

	@Column({ nullable: false })
	email: string;

	@Column({ nullable: true })
	code: number;

	@Column({ default: false })
	used: boolean;

	@ManyToOne(() => User, (user) => user.emails, { cascade: true })
	user: User;

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
