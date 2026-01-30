import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { ChatService } from '../chat.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  messages: WritableSignal<any[]> = signal([]);
  messageInput = '';
  private subs: Subscription[] = [];

  token: string | null = '';
  username: string | null = '';

  router: Router = inject(Router);

  constructor(private chatService: ChatService) {}

  async ngOnInit() {
    this.token = sessionStorage.getItem('token');
    this.username = sessionStorage.getItem('username');

    console.log(await this.validateToken());
    if (!(await this.validateToken())) {
      console.log('tokne invalid redirecting to login...');
      this.router.navigate(['/login']);
    } else {
      this.chatService.connect(this.token!);
    }

    this.subs.push(
      this.chatService.onMessage().subscribe((msg) => {
        this.messages.set([...this.messages(), msg]);
        console.log(this.messages());
      }),
      this.chatService.onUserDisconnect().subscribe((msg) => {
        this.messages.set([...this.messages(), { system: msg }]);
        console.log(this.messages());
      }),
    );
  }

  sendMessage(): void {
    if (this.messageInput.trim()) {
      this.chatService.sendMessage(this.messageInput);
      this.messageInput = '';
    }
  }
  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.chatService.disconnect();
  }

  async validateToken() {
    if (!this.token) {
      return null;
    }
    const resp = await fetch(this.chatService.apiUrl + '/auth', {
      headers: { authorization: 'Bearer ' + this.token },
    });
    if (resp.status === 401 || resp.status === 500) {
      console.log('token invalid');
      return false;
    }
    return true;
  }
}
