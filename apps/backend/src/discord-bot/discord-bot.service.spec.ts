import { Test, TestingModule } from '@nestjs/testing';
import { DiscordProposalService } from './services/discord-proposal.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DiscordServer } from 'src/discord-server/entities/discord-server-entity';
import { Proposal } from 'src/proposal/entities/proposal.entity';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { Community } from 'src/community/entities/community.entity';
import { Vote } from 'src/vote/entities/vote.entity';
import { DiscordClientService } from './services/discord-client.service';

describe('DiscordProposalService', () => {
	let service: DiscordProposalService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DiscordProposalService,
				DiscordClientService,
				{ provide: getRepositoryToken(DiscordServer), useValue: {} },
				{ provide: getRepositoryToken(Proposal), useValue: {} },
				{ provide: getRepositoryToken(UserEntity), useValue: {} },
				{ provide: getRepositoryToken(Community), useValue: {} },
				{ provide: getRepositoryToken(Vote), useValue: {} },
			],
		}).compile();

		service = module.get<DiscordProposalService>(DiscordProposalService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
