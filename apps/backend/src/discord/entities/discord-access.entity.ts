import { Platform } from "src/platform/entities/platform.entity";
import { User } from "src/user/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { DiscordChannel } from "./discord-channel.entity";
import { userInfo } from "node:os";

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