import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	Logger,
	Query,
} from '@nestjs/common';
import { UpdateUserDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from './decorator';
import { User as UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { Public } from '../auth/auth.decorator';
import { User as UserDecorator } from './decorator';
@ApiTags('User')
@Controller('user')
export class UserController {
	private readonly logger = new Logger(UserController.name);

	constructor(private readonly userService: UserService) {}

	@Public()
	@Get('all')
	async findAllUsers(@Query('search') search?: string) {
		return this.userService.findAll(search);
	}

	@Get()
	async findOne(@User() user: UserEntity) {
		console.log(user);

		return { user };
	}

	@Delete('/by-email/:email')
	byEmail(@Param('email') email: string) {
		return this.userService.deleteByEmail(email);
	}

	@Get('my-invitations')
	async getMyInvitations(@User() user: UserEntity) {
		return this.userService.getInvitationsForUser(user.id);
	}

	@Post('accept/:communityId')
	async acceptInvitation(
		@Param('communityId') communityId: number,
		@UserDecorator() user: UserEntity,
	) {
		return this.userService.acceptInvitation(communityId, user.id);
	}

	@Post('decline/:communityId')
	async declineInvitation(
		@Param('communityId') communityId: number,
		@UserDecorator() user: UserEntity,
	) {
		return this.userService.declineInvitation(communityId, user.id);
	}
}
