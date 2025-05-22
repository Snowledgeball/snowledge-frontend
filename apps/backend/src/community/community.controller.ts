import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommunityService } from './community.service';
import { Community } from './entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Communities')
@Controller('communities')
export class CommunityController {
	constructor(private readonly communityService: CommunityService) {}

	@Get('all')
	findAll(): Promise<Community[]> {
		return this.communityService.findAll();
	}

	@Get(':slug')
	findOneBySlug(@Param('slug') slug: string): Promise<Community> {
		return this.communityService.findOneBySlug(slug);
	}

	@Post()
	create(@Body() data: CreateCommunityDto): Promise<Community> {
		return this.communityService.create(data);
	}
}
