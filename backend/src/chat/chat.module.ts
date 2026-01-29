import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-gateway';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { ChatService } from './chat.service';
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [ChatGateway, UserService, ChatService],
})
export class ChatModule {}
