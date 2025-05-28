import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordChannel } from './entities/discord-channel.entity';
import { DiscordMessage } from './entities/discord-message.entity';
import { DiscordServer } from './entities/discord-server.entity';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';
import { DiscordProvider } from './discord.provider';
import { UserModule } from 'src/user/user.module';
import { DiscordAccess } from './entities/discord-access.entity';

@Module({    
    imports: [
        TypeOrmModule.forFeature([
            DiscordAccess,
            DiscordChannel,
            DiscordMessage,
            DiscordServer,
        ]),
        UserModule,
    ], 
    controllers: [DiscordController], 
    providers: [DiscordProvider, DiscordService]
})
export class DiscordModule {}
