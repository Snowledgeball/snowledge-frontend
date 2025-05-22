import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	Logger,
} from '@nestjs/common';
import { UpdateUserDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from './decorator';
import { User as UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { Public } from '../auth/auth.decorator';
@ApiTags('User')
@Controller('user')
export class UserController {
	private readonly logger = new Logger(UserController.name);

	constructor(
		private readonly userService: UserService,
	) {}

	@Public()
	@Get('all')
	findAll() {
		return this.userService.findAll();
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

}
