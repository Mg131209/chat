import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import { ChatService } from './chat.service';
import { ConnectUserDto } from './dto/conect-user.dto';
import { MessageDto } from './dto/message-dto';

@WebSocketGateway(3002, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  connectedUsers: ConnectUserDto[] = [];
  @WebSocketServer() server: Server;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
  ) {}

  async handleConnection(client: Socket) {
    const raw = client.handshake.headers['auth'];
    const token = Array.isArray(raw) ? raw[0] : raw;
    if (!token || !(await this.chatService.validateToken(token))) {
      client.emit('reply', 'un authorized');
    } else {
      const id = this.chatService.getIdFromToken(token);
      const connectedUser = await this.chatService.getConnectedUser(
        id,
        client.id,
      );
      if (connectedUser) {
        this.connectedUsers.push(connectedUser);
      } else {
        client.emit('reply', 'token incorect');
      }
    }
  }

  handleDisconnect(client: Socket) {
    const username = this.getConnectedUser(client.id)?.username;
    this.server.emit('on_user_disconnect', `User ${username} left`);
  }

  @SubscribeMessage('message')
  async handleNewMessage(client: Socket, inputMessage: string) {
    const user = this.getConnectedUser(client.id);
    if (!user) {
      await this.handleConnection(client);
    } else {
      const outputMessage: MessageDto = {
        message: inputMessage,
        username: user.username,
        userId: user.userId,
      };
      this.server.emit('message', outputMessage);
    }
  }
  getConnectedUser(id): ConnectUserDto | undefined {
    const user = this.connectedUsers.find((user) => user.connectionId === id);
    return user;
  }
}
