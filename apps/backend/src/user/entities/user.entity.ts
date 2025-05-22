
import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	OneToMany,
	CreateDateColumn,
	UpdateDateColumn,
	BeforeInsert,
} from 'typeorm';


import { randomUUID } from 'node:crypto';
import { Gender } from 'src/shared/interface/enums/gender';
import { Email } from 'src/email/entities/email.entity';


@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true, unique: true })
	email: string;

	@Column()
	firstname: string;

	@Column()
	lastname: string;

	@Column()
	pseudo: string;

	@Column({
		type: "enum",
        enum: Gender,
	})
	gender: Gender;
	
	@Column()
	age: number;

	@Column()
	password: string;

	@Column({ default: false })
	isActive: boolean;

	@Column({ nullable: true })
	referrer: string;

	@Column({ unique: true })
	referral: string;

	@OneToMany(() => Email, (email) => email.user)
	emails: Email[];
	
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

	@BeforeInsert()
	lowercase() {
		this.isActive = Boolean(false);
		this.referral = randomUUID().replace(/-g/, '').slice(0, 8);
	}
}
