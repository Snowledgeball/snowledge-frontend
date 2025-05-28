import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { DiscordService } from './discord.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class DiscordProvider {
    private readonly logger = new Logger(DiscordProvider.name);
    constructor(
		private readonly discordService: DiscordService,
		private readonly userService: UserService,
	) {}

    async linkDiscord(code: string, user: User) {
		console.log('code', code)
        const response = await fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			body: new URLSearchParams({
				client_id: "1377001604179558491",
				client_secret: "ODqCCIVOSKqzjQ-NiebVGwh1rO6UndV4",
				code,
				grant_type: 'authorization_code',
				redirect_uri: `http://localhost:4000/discord/link`,
				scope: 'identify guilds email  messages.read connections',
			}).toString(),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});
		const data = await response.json();
		console.log(data)
		const discordAccess = await this.discordService.createDiscordAccess({
			accessToken: data.access_token,
			tokenType: data.token_type,
			expiresIn: data.expires_in,
			refreshToken: data.refresh_token,
			scope: data.scope,
		})
		
		await this.userService.update(user.id, { discordAccess: discordAccess });
	
    }
}
