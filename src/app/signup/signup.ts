import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  username = '';
  password = '';
  confirm = '';
  error = '';
  success = '';

  signup() {
    if (!this.username || !this.password || !this.confirm) {
      this.error = 'All fields are required!';
      return;
    }
    if (this.password !== this.confirm) {
      this.error = 'Passwords do not match!';
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      const existing = localStorage.getItem('user_' + this.username);
      if (existing) {
        this.error = 'Username already exists!';
        return;
      }
      localStorage.setItem('user_' + this.username, this.password);
    }
    this.success = 'Account created! Redirecting to login...';
    this.error = '';
    setTimeout(() => this.router.navigate(['/login']), 1500);
  }
}
