import { Module } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';
import { DiscordProvider } from './discord.provider';
import { UserModule } from 'src/user/user.module';
import { DiscordAccess } from './entities/discord-access.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityModule } from 'src/community/community.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
	DiscordChannel,
	DiscordChannelSchema,
} from './schemas/discord-channel.schema';
import {
	DiscordHarvestJob,
	DiscordHarvestJobSchema,
} from './schemas/discord-harvest-job.schema';
import {
	DiscordMessage,
	DiscordMessageSchema,
} from './schemas/discord-message.schema';
import {
	DiscordServer,
	DiscordServerSchema,
} from './schemas/discord-server.schema';
import { DiscordServerModule } from 'src/discord-server/discord-server.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([DiscordAccess]),
		MongooseModule.forFeature([
			{ name: DiscordChannel.name, schema: DiscordChannelSchema },
			{ name: DiscordHarvestJob.name, schema: DiscordHarvestJobSchema },
			{ name: DiscordMessage.name, schema: DiscordMessageSchema },
			{ name: DiscordServer.name, schema: DiscordServerSchema },
		]),
		CommunityModule,
		UserModule,
		DiscordServerModule,
	],
	controllers: [DiscordController],
	providers: [DiscordProvider, DiscordService],
	exports: [DiscordProvider, DiscordService],
})
export class DiscordModule {}
