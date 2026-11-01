import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DataService, RestaurantSettings } from '../data/data';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  ds = inject(DataService);

  form: RestaurantSettings = { ...this.ds.settings() };
  saved = false;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('loggedIn') !== 'true' || localStorage.getItem('currentUser') !== 'admin') {
        this.router.navigate(['/login']);
      }
    }
    this.form = { ...this.ds.settings() };
  }

  save() {
    this.ds.saveSettings({ ...this.form });
    this.saved = true;
    setTimeout(() => this.saved = false, 3000);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) { localStorage.removeItem('loggedIn'); localStorage.removeItem('currentUser'); }
    this.router.navigate(['/login']);
  }
}
