import {
  Controller,
  Get,
  Post,
  UsePipes,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from './auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAllUsers() {
    return this.userService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard)
  createUser(@Body() user: any) {
    return { message: 'User created successfully', user };
  }
}
