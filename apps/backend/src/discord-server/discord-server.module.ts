import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordServerService } from './discord-server.service';
import { DiscordServerController } from './discord-server.controller';
import { DiscordServer } from './entities/discord-server-entity';
import { Community } from '../community/entities/community.entity';

@Module({
	imports: [TypeOrmModule.forFeature([DiscordServer, Community])],
	controllers: [DiscordServerController],
	providers: [DiscordServerService],
	exports: [DiscordServerService],
})
export class DiscordServerModule {}
