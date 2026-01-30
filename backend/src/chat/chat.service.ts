import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { ConnectUserDto } from './dto/conect-user.dto';
import { MessageDto } from './dto/message-dto';

type TokenPayload = { sub: string; username: string; id: string };
@Injectable()
export class ChatService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(message: MessageDto): Promise<boolean> {
    if (!message || !message.userId) {
      return false;
    }
    const user = await this.userService.getOne(message.userId);
    if (!user) {
      return false;
    }
    return true;
  }
  getIdFromToken(token: string): string {
    const tokenPayload: TokenPayload = this.jwtService.decode(token);
    return tokenPayload.sub;
  }

  async getConnectedUser(
    id: string,
    connectionId: string,
  ): Promise<ConnectUserDto | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    const connectedUser: ConnectUserDto = {
      userId: id,
      username: user.username,
      connectionId: connectionId,
    };
    return connectedUser;
  }

  async validateToken(token) {
    try {
      const tokenPayload = await this.jwtService.verifyAsync(token);
      return true;
    } catch (error) {
      return false;
    }
  }
}
