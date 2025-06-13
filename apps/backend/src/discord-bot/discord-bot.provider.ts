import { Injectable } from '@nestjs/common';
import { DiscordService } from '../discord/discord.service';
import { UserService } from 'src/user/user.service';
import { Gender } from 'src/shared/enums/Gender';
import { CommunityService } from 'src/community/community.service';
import { LearnerService } from 'src/learner/learner.service';
import { DiscordClientService } from './services/discord-client.service';

@Injectable()
export class DiscordBotProvider {
	constructor(
		private readonly discordService: DiscordService,
		private readonly userService: UserService,
		private readonly communityService: CommunityService,
		private readonly learnerService: LearnerService,
		private readonly discordClientService: DiscordClientService,
	) {}

	async linkDiscord(code: string, guildId: string) {
		console.log('code', code);
		const response = await fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			body: new URLSearchParams({
				client_id: process.env.DISCORD_CLIENT_ID,
				client_secret: process.env.DISCORD_CLIENT_SECRET,
				code,
				grant_type: 'authorization_code',
				redirect_uri: `${process.env.BACK_URL}/discord-bot/link`,
				scope: 'identify email',
			}).toString(),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});
		const data = await response.json();
		const discordAccess = await this.discordService.createDiscordAccess({
			accessToken: data.access_token,
			tokenType: data.token_type,
			expiresIn: data.expires_in,
			refreshToken: data.refresh_token,
			scope: data.scope,
		});

		const userResponse = await fetch('https://discord.com/api/users/@me', {
			headers: {
				Authorization: `Bearer ${data.access_token}`,
			},
		});
		const discordUser = await userResponse.json();
		const email = discordUser.email;
		const username = discordUser.username;
		const discriminator = discordUser.discriminator;

		let user = await this.userService.findOneByEmail(email);

		if (!user) {
			user = await this.userService.create({
				email: email,
				firstname: username,
				lastname: discriminator,
				pseudo: username,
				password: data.access_token,
				gender: Gender.Male,
				age: new Date(),
			});

			const community =
				await this.communityService.findOneByDiscordServerId(guildId);

			if (!community) {
				throw new Error('Community not found');
			}

			await this.learnerService.create(user.id, community.id);

			await this.userService.update(user.id, {
				discordAccess: discordAccess,
				discordId: discordUser.id,
			});

			// Attribution du rôle Discord
			const client = this.discordClientService?.getClient?.();
			if (!client) throw new Error('Client Discord non initialisé');
			const guild = await client.guilds.fetch(guildId);
			const member = await guild.members.fetch(discordUser.id);
			const role = guild.roles.cache.find(
				(r) => r.name === 'Snowledge Authenticated',
			);
			if (!role) {
				throw new Error(
					"Le rôle 'Snowledge Authenticated' n'existe pas sur ce serveur !",
				);
			}

			await member.roles.add(role.id);
		}

		return user;
	}
}
