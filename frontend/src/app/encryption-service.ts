import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  privateKey!: CryptoKey;
  publicKey!: CryptoKey;
  router: Router = inject(Router);
  async encryptMessage(message: string) {
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      this.publicKey,
      encodedMessage,
    );

    const encryptedBytes = new Uint8Array(encrypted);
    const encryptedBase64 = btoa(String.fromCharCode(...encryptedBytes));

    console.log(encryptedBase64);
    return encryptedBase64;
  }
  async decryptMessage(encryptedBase64: string) {
    console.log(encryptedBase64);
    const encryptedBytes = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      this.privateKey,
      encryptedBytes,
    );

    const decoder = new TextDecoder();
    const decryptedMessage = decoder.decode(decryptedBuffer);

    console.log('Decrypted message:', decryptedMessage);
    return decryptedMessage;
  }
  async generateKeyPair() {
    let keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt'],
    );

    const publicKeyBytes = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyBytes)));

    localStorage.setItem('publicKey', publicKeyBase64);

    const privateKeyBytes = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    const privateKeyBas64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyBytes)));

    localStorage.setItem('privateKey', privateKeyBas64);
  }

  // Restore keys
  async loadKeyPair() {
    const publicKeyBase64 = localStorage.getItem('publicKey');
    const privateKeyBase64 = localStorage.getItem('privateKey');
    if (!(publicKeyBase64 && privateKeyBase64)) {
      this.generateKeyPair();
      this.router.navigate(['/']);
      return;
    }
    const publicKeyBuffer = Uint8Array.from(atob(publicKeyBase64), (c) => c.charCodeAt(0));
    const privateKeyBuffer = Uint8Array.from(atob(privateKeyBase64), (c) => c.charCodeAt(0));

    this.publicKey = await crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt'],
    );

    this.privateKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['decrypt'],
    );
  }
}
