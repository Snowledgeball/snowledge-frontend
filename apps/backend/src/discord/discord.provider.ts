import { Inject, Injectable, Logger } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { DiscordService } from './discord.service';
import { UserService } from 'src/user/user.service';
import discordConfig from 'src/config/discord.config';
import { ConfigType } from '@nestjs/config';
import { CommunityService } from 'src/community/community.service';
import { Community } from 'src/community/entities/community.entity';
import { DiscordServerService } from 'src/discord-server/discord-server.service';

@Injectable()
export class DiscordProvider {
	private readonly logger = new Logger(DiscordProvider.name);
	constructor(
		@Inject(discordConfig.KEY)
		private configDiscord: ConfigType<typeof discordConfig>,
		private readonly discordService: DiscordService,
		private readonly userService: UserService,
		private readonly communityService: CommunityService,
		private readonly discordServerService: DiscordServerService,
	) {}

	async linkDiscord(code: string, user: User, communityId?: number) {
		let data: any;
		let community: Community;
		try {
			const response = await fetch(
				'https://discord.com/api/oauth2/token',
				{
					method: 'POST',
					body: new URLSearchParams({
						client_id: this.configDiscord.clientId,
						client_secret: this.configDiscord.clientSecret,
						code,
						grant_type: 'authorization_code',
						redirect_uri: this.configDiscord.redirect,
						scope: 'bot identify guilds email',
					}).toString(),
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			);
			data = await response.json();
			console.log('data', data);
		} catch (error) {
			console.log('error', error);
			this.logger.error(error);
		}

		console.log('ICI');

		if (data && !data.error) {
			console.log('DATTT', data);
			const discordAccess = await this.discordService.createDiscordAccess(
				{
					accessToken: data.access_token,
					tokenType: data.token_type,
					expiresIn: data.expires_in,
					refreshToken: data.refresh_token,
					scope: data.scope,
				},
			);

			let userInfo;
			try {
				const userResult = await fetch(
					'https://discord.com/api/users/@me',
					{
						headers: {
							authorization: `${data.token_type} ${data.access_token}`,
						},
					},
				);
				userInfo = await userResult.json();
			} catch (error) {
				this.logger.error(error);
			}

			console.log('userInfo', userInfo);
			if (userInfo) {
				console.log('communityId', communityId);
				if (communityId) {
					try {
						community =
							await this.communityService.findOneById(
								communityId,
							);

						console.log('data', data);
						console.log('communityId', communityId);
						await this.discordServerService.create({
							communityId,
							guildId: data.guild.id,
							guildName: data.guild.name,
						});
					} catch (error) {
						this.logger.error(error);
						throw new Error('Error creating discord server', error);
					}
				}
				await this.userService.update(user.id, {
					discordId: userInfo.id,
					discordAccess: discordAccess,
				});
			}
		} else {
			this.logger.error('Error client information');
		}
		return community;
	}
}
