import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  url: string = 'http://localhost:3000/auth/login';

  username: string = '';
  password: string = '';

  router: Router = inject(Router);
  async login() {
    const resp = await fetch(this.url, {
      method: 'POST',
      body: JSON.stringify({
        username: this.username,
        password: this.password,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    console.log(resp.status);
    if (resp.status !== 401) {
      const body = await resp.json();
      const token = body.token;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('username', body.username);
      this.router.navigate(['/']);
    } else {
      alert('Wrong credentials');
    }
  }
}
