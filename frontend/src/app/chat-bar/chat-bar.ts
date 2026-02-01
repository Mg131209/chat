import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';

type User = { username: string; id: string };
@Component({
  selector: 'app-chat-bar',
  imports: [],
  templateUrl: './chat-bar.html',
  styleUrl: './chat-bar.css',
})
export class ChatBar implements OnInit {
  constructor(private chatService: ChatService) {}

  users: User[] = [];
  async ngOnInit() {
    const resp = await fetch(this.chatService.apiUrl + '/user', {
      headers: { authorization: 'Bearer ' + this.chatService.token },
    });

    this.users = await resp.json();
  }

  selectChat(id: string) {
    this.chatService.selectedChatId = id;
  }
}
