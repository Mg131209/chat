import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket!: Socket;
  apiUrl = 'http://localhost:3000';
  websocketUrl = 'http://localhost:3002';
  constructor() {}
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

  sendMessage(message: string): void {
    this.socket.emit('message', message);
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
