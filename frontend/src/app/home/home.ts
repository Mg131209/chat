import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService } from '../chat.service';
import { EncryptionService } from '../encryption-service';

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

  constructor(
    private chatService: ChatService,
    private encryptionService: EncryptionService,
  ) {}

  async ngOnInit() {
    this.token = sessionStorage.getItem('token');
    this.username = sessionStorage.getItem('username');

    if (localStorage.getItem('publicKey') && localStorage.getItem('privateKey')) {
      await this.encryptionService.loadKeyPair();
    } else {
      await this.encryptionService.generateKeyPair();
      await this.encryptionService.loadKeyPair();
    }
    if (!(await this.validateToken())) {
      this.router.navigate(['/login']);
    } else {
      this.chatService.connect(this.token!);
    }

    this.subs.push(
      this.chatService.onMessage().subscribe(async (msg) => {
        this.messages.set([
          ...this.messages(),
          { ...msg, message: await this.encryptionService.decryptMessage(msg.message) },
        ]);
        console.log;
        console.log(await this.encryptionService.decryptMessage(msg.message));
      }),
      this.chatService.onUserDisconnect().subscribe(async (msg) => {
        this.messages.set([...this.messages(), { system: msg }]);
        console.log(msg);
      }),
    );
  }

  async sendMessage() {
    if (this.messageInput.trim()) {
      await this.chatService.sendMessage(this.messageInput, 'd6756c91-cd86-45b3-b3df-b1742caa4cd9');
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
      return false;
    }
    return true;
  }
}
