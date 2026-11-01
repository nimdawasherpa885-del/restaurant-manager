import { Component, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DataService, MenuItem } from '../data/data';

interface User { username: string; role: string; }

@Component({
  selector: 'app-admin',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  ds = inject(DataService);

  activeTab = signal<'users' | 'menu' | 'tables'>('users');

  // --- Users ---
  users = signal<User[]>([]);

  loadUsers() {
    if (!isPlatformBrowser(this.platformId)) return;
    const list: User[] = [{ username: 'admin', role: 'Admin' }];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      if (key.startsWith('user_')) list.push({ username: key.replace('user_', ''), role: 'Staff' });
    }
    this.users.set(list);
  }

  deleteUser(username: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem('user_' + username);
    this.loadUsers();
  }

  // --- Menu ---
  newItem = { name: '', price: 0, category: '', description: '', available: true };
  editingId: number | null = null;

  startEdit(item: MenuItem) {
    this.editingId = item.id;
    this.newItem = { name: item.name, price: item.price, category: item.category, description: item.description, available: item.available };
  }

  saveEdit() {
    if (this.editingId) {
      this.ds.updateMenuItem(this.editingId, { ...this.newItem });
      this.editingId = null;
      this.newItem = { name: '', price: 0, category: '', description: '', available: true };
    }
  }

  addMenuItem() {
    if (!this.newItem.name || !this.newItem.price || !this.newItem.category) return;
    this.ds.addMenuItem({ ...this.newItem });
    this.newItem = { name: '', price: 0, category: '', description: '', available: true };
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) { localStorage.removeItem('loggedIn'); localStorage.removeItem('currentUser'); }
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (!localStorage.getItem('loggedIn') || localStorage.getItem('currentUser') !== 'admin') {
        this.router.navigate(['/login']); return;
      }
    }
    this.loadUsers();
  }
}
