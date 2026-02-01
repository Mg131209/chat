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
      client.emit('reply', 'unauthorized');
      client.disconnect();
      return;
    }

    const userId = this.chatService.getIdFromToken(token);
    const connectedUser = await this.chatService.getConnectedUser(
      userId,
      client.id,
    );

    if (!connectedUser) {
      client.emit('reply', 'token incorrect');
      client.disconnect();
      return;
    }

    this.connectedUsers = this.connectedUsers.filter(
      (user) => user.userId !== userId,
    );

    this.connectedUsers.push(connectedUser);
  }

  handleDisconnect(client: Socket) {
    const username = this.getConnectedUser(client.id)?.username;
    this.connectedUsers = this.connectedUsers.filter(
      (user) => user.connectionId !== client.id,
    );
    this.server.emit('on_user_disconnect', `User ${username} left`);
  }

  @SubscribeMessage('message')
  async handleNewMessage(client: Socket, inputMessage: string) {
    const user = this.getConnectedUser(client.id);
    if (!user) {
      await this.handleConnection(client);
    } else {
      const messageObject = JSON.parse(inputMessage);
      const targetUser = messageObject.userId;
      const targetSession = this.getSessionIdFromUser(targetUser);
      if (!targetSession) {
        client.emit('reply', 'target user not found');
        return;
      }

      const outputMessage: MessageDto = {
        message: messageObject.message,
        username: user.username,
        userId: user.userId,
      };
      this.server.to(targetSession).emit('message', outputMessage);
      client.emit('message', outputMessage);
    }
  }
  getConnectedUser(id): ConnectUserDto | undefined {
    const user = this.connectedUsers.find((user) => user.connectionId === id);
    return user;
  }
  getSessionIdFromUser(userId: string) {
    const sessionId = this.connectedUsers.find(
      (user) => user.userId === userId,
    )?.connectionId;

    return sessionId;
  }
}
