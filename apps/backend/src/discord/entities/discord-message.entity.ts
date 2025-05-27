import { Entity, Index, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { DiscordChannel } from "./discord-channel.entity";

@Entity()
@Index(['channel', 'created_at'], { unique: false })
@Index(['fetchedAt'], { unique: false })
export class DiscordMessage {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => DiscordChannel, (channel) => channel.messages, { cascade: true })
  channel: DiscordChannel;

  @Column()
  authorUserUd: string;

  @Column({ nullable: true })
  content: string;

  @Column({
    type: 'timestamp',
  })
  fetchedAt: Date;

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