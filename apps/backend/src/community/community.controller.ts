import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	ConflictException,
	Put,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { Community } from './entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { UpdateCommunityDto } from './dto/update-community.dto';

@ApiTags('Communities')
@Controller('communities')
export class CommunityController {
	constructor(private readonly communityService: CommunityService) {}

	@Get('all')
	findAll(): Promise<Community[]> {
		return this.communityService.findAll();
	}

	@Get('all/:userId')
	findAllByUser(@Param('userId') userId: number): Promise<Community[]> {
		return this.communityService.findAllByUser(userId);
	}

	@Get(':slug')
	findOneBySlug(@Param('slug') slug: string): Promise<Community> {
		return this.communityService.findOneBySlug(slug);
	}

	// @Get(':name')
	// findOneByName(@Param('name') name: string): Promise<Community> {
	// 	return this.communityService.findOneByName(name);
	// }

	@Get(':slug/creator')
	getCommunityCreatorFromSlug(@Param('slug') slug: string): Promise<User> {
		return this.communityService.getCommunityCreatorFromSlug(slug);
	}

	@Post()
	async create(@Body() createCommunityDto: CreateCommunityDto) {
		const existing = await this.communityService.findOneByName(
			createCommunityDto.name,
		);
		if (existing) {
			throw new ConflictException(
				'A community with this name already exists.',
			);
		}
		return this.communityService.create(createCommunityDto);
	}

	@Put(':id')
	async update(
		@Param('id') id: number,
		@Body() updateCommunityDto: UpdateCommunityDto,
	) {
		return this.communityService.update(id, updateCommunityDto);
	}
}
