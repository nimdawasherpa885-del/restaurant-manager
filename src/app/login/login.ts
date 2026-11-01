import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  username = '';
  password = '';
  error = '';

  login() {
    if (!this.username || !this.password) {
      this.error = 'Please fill in all fields!';
      return;
    }

    // default admin account
    if (this.username === 'admin' && this.password === '1234') {
      this.setLoggedIn();
      return;
    }

    // check registered users
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('user_' + this.username);
      if (saved && saved === this.password) {
        this.setLoggedIn();
        return;
      }
    }

    this.error = 'Wrong username or password!';
  }

  private setLoggedIn() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('currentUser', this.username);
    }
    if (this.username === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
