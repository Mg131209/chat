import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/user.entity';

type SignInData = { id: string; username: string };
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository,
  ) {}

  async validateUser(user: CreateUserDto) {
    const userData = await this.userRepository.findOne({
      where: { username: user.username },
    });
    if (!userData) {
      throw new NotFoundException('user not found');
    }

    return this.signIn({ id: userData.id, username: userData.username });
  }

  async signIn(user: SignInData) {
    const tokenPayload = { sub: user.id, username: user.username };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return {
      token: accessToken,
      id: tokenPayload.sub,
      username: tokenPayload.username,
    };
  }

  
}
