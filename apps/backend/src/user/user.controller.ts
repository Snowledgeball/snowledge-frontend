import {
  Controller,
  Get,
  Post,
  UsePipes,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserValidationPipe } from 'src/user-validation/user-validation.pipe';
import { AuthGuard } from './auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAllUsers() {
    return this.userService.findAll();
  }

  @Post()
  @UsePipes(UserValidationPipe)
  @UseGuards(AuthGuard)
  createUser(@Body() user: any) {
    return { message: 'User created successfully', user };
  }
}
