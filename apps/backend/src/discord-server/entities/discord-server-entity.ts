import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Community } from '../../community/entities/community.entity';

@Entity()
export class DiscordServer {
	@PrimaryGeneratedColumn()
	id: number; // Identifiant unique du serveur Discord dans la base

	@Column({ type: 'varchar', length: 32, unique: true })
	discordGuildId: string; // Identifiant du serveur Discord (guild)

	@Column({ type: 'varchar', length: 32, nullable: true })
	proposeChannelId?: string; // Channel propositions

	@Column({ type: 'varchar', length: 32, nullable: true })
	voteChannelId?: string; // Channel votes

	@Column({ type: 'varchar', length: 32, nullable: true })
	resultChannelId?: string; // Channel résultats

	// Ajoute ici d'autres paramètres Discord utiles (webhook, rôle, etc.)

	@ManyToOne(() => Community, (community) => community.discordServers, {
		onDelete: 'CASCADE',
	})
	community: Community; // Lien vers la communauté associée
}
