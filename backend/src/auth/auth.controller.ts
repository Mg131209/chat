import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get()
  authorizeUser(@Headers('authorization') token: string) {
    return this.authService.validateToken(token.split(' ')[1]);
  }
  @Post('/login')
  validateUser(@Body() user: CreateUserDto) {
    try {
      return this.authService.validateUser(user);
    } catch {
      return false;
    }
  }
}
