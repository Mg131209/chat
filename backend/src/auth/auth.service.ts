import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import path from 'path';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/user.entity';

import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

type SignInData = { id: string; username: string };
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(user: CreateUserDto) {
    const userData = await this.userRepository.findOne({
      where: { username: user.username },
    });
    if (!userData) {
      throw new UnauthorizedException();
    }
    if (await bcrypt.compare(user.password, userData.password)) {
      return this.signIn({ id: userData.id, username: userData.username });
    }
    throw new UnauthorizedException();
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

  async validateToken(token: string) {
    return this.jwtService.verifyAsync(token);
  }
}
