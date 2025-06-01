import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProposalService } from './proposal.service';
import { CreateProposalDto } from './dto/create-proposal.dto/create-proposal.dto';
import { Proposal } from './entities/proposal.entity';

@Controller('communities/:communitySlug/proposals')
export class ProposalController {
	constructor(private readonly proposalService: ProposalService) {}

	// GET /proposals
	@Get()
	findAll(
		@Param('communitySlug') communitySlug: string,
	): Promise<Proposal[]> {
		return this.proposalService.findAllForACommunityBySlug(communitySlug);
	}

	// GET /proposals/:id
	@Get(':id')
	findOne(
		@Param('communitySlug') communitySlug: string,
		@Param('id') id: number,
	): Promise<Proposal> {
		return this.proposalService.findOne(id, communitySlug);
	}

	// POST /proposals
	@Post()
	create(
		@Param('communitySlug') communitySlug: string,
		@Body() createProposalDto: CreateProposalDto,
	): Promise<Proposal> {
		return this.proposalService.create(createProposalDto, communitySlug);
	}
}
