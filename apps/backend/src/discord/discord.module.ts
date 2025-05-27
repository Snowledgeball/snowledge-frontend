import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordChannel } from './entities/discord-channel.entity';
import { DiscordMessage } from './entities/discord-message.entity';
import { DiscordServer } from './entities/discord-server.entity';

@Module({    
    imports: [
        TypeOrmModule.forFeature([
            DiscordServer,
            DiscordChannel,
            DiscordMessage
        ]),
    ]})
export class DiscordModule {}
