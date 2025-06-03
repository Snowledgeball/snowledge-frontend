import { Module } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';
import { DiscordProvider } from './discord.provider';
import { UserModule } from 'src/user/user.module';
import { DiscordAccess } from './entities/discord-access.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityModule } from 'src/community/community.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([DiscordAccess]), 
		CommunityModule,
		UserModule,
	],
	controllers: [DiscordController],
	providers: [DiscordProvider, DiscordService],
})
export class DiscordModule {}
