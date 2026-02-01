import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { EncryptionService } from './encryption-service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket!: Socket;
  apiUrl = 'http://localhost:3000';
  websocketUrl = 'http://localhost:3002';

  token: string | null = '';
  selectedChatId: string = '';
  constructor(private encryptionService: EncryptionService) {}
  connect(token: string): void {
    this.socket = io(this.websocketUrl, {
      extraHeaders: {
        auth: token,
      },
    });

    this.socket.on('connect', () => {
      console.log('connected to chat socket');
    });

    this.socket.on('disconnect', () => {
      console.log('disconnected from chat socket');
    });

    this.socket.on('reply', (msg) => {
      console.log('Server reply: ', msg);
    });
  }

  async sendMessage(message: string) {
    const messageObject = {
      userId: this.selectedChatId,
      message: await this.encryptionService.encryptMessage(message),
    };
    this.socket.emit('message', JSON.stringify(messageObject));
  }

  onMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('message', (data) => {
        observer.next(data);
      });
    });
  }

  onUserDisconnect(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('on_user_disconnect', (msg) => {
        observer.next(msg);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
