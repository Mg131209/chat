import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from 'src/auth/auth-guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  addOne(@Body() createUser: CreateUserDto) {
    return this.userService.addOne(createUser);
  }
  @UseGuards(AuthGuard)
  @Get()
  async gestAll() {
    return this.userService.getAll();
  }
}
