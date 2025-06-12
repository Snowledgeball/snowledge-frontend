import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { DiscordService } from '../discord/discord.service';
import { UserService } from 'src/user/user.service';
import { Gender } from 'src/shared/enums/Gender';

@Injectable()
export class DiscordBotProvider {
	constructor(
		private readonly discordService: DiscordService,
		private readonly userService: UserService,
	) {}

	async linkDiscord(code: string) {
		console.log('code', code);
		const response = await fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			body: new URLSearchParams({
				client_id: process.env.DISCORD_CLIENT_ID,
				client_secret: process.env.DISCORD_CLIENT_SECRET,
				code,
				grant_type: 'authorization_code',
				redirect_uri: process.env.DISCORD_REDIRECT_URI,
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
		const user = await this.userService.create({
			email: email,
			firstname: username,
			lastname: discriminator,
			pseudo: username,
			password: data.access_token,
			gender: Gender.Male,
			age: new Date(),
		});

		await this.userService.update(user.id, {
			discordAccess: discordAccess,
		});

		return user;
	}
}
