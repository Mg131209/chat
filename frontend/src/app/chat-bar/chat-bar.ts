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

  selectedUserId = '';
  users: User[] = [];
  async ngOnInit() {
    const resp = await fetch(this.chatService.apiUrl + '/user', {
      headers: { authorization: 'Bearer ' + this.chatService.token },
    });

    this.users = await resp.json();
    this.users = this.users.filter((user) => user.username !== sessionStorage.getItem('username'));
    this.chatService.selectedChatId.set(this.users[0].id);
  }

  selectChat(id: string) {
    this.selectedUserId = id;
    this.chatService.selectedChatId.set(id);
  }
}
