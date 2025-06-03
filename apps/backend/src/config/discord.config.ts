import { registerAs } from '@nestjs/config';
import { DiscordConfig } from './types/discord';

export default registerAs('discordConfig', (): DiscordConfig => {
    console.log()
    return {
        clientId: process.env.DISCORD_CLIENT_ID || '',
        clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
        redirect: `${process.env.BACK_URL}/discord/link` || ''
    };
});
