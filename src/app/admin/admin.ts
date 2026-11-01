import { Component, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

interface User {
  username: string;
  role: string;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

@Component({
  selector: 'app-admin',
  imports: [FormsModule, CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  activeTab = signal<'users' | 'menu' | 'tables'>('users');

  // --- Users ---
  users = signal<User[]>([]);

  loadUsers() {
    if (!isPlatformBrowser(this.platformId)) return;
    const list: User[] = [{ username: 'admin', role: 'Admin' }];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      if (key.startsWith('user_')) {
        list.push({ username: key.replace('user_', ''), role: 'Staff' });
      }
    }
    this.users.set(list);
  }

  deleteUser(username: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem('user_' + username);
    this.loadUsers();
  }

  // --- Menu ---
  menuItems = signal<MenuItem[]>([]);
  newItem = { name: '', price: 0, category: '' };

  loadMenu() {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem('menuItems');
    if (saved) {
      this.menuItems.set(JSON.parse(saved));
    } else {
      const defaults: MenuItem[] = [
        { id: 1, name: 'Burger', price: 8.99, category: 'Main' },
        { id: 2, name: 'Pizza', price: 12.99, category: 'Main' },
        { id: 3, name: 'Salad', price: 6.5, category: 'Starter' },
        { id: 4, name: 'Fries', price: 3.5, category: 'Side' },
        { id: 5, name: 'Coke', price: 2.0, category: 'Drink' },
      ];
      this.menuItems.set(defaults);
      this.saveMenu(defaults);
    }
  }

  saveMenu(items: MenuItem[]) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('menuItems', JSON.stringify(items));
    }
  }

  addMenuItem() {
    if (!this.newItem.name || !this.newItem.price || !this.newItem.category) return;
    const updated = [...this.menuItems(), { id: Date.now(), ...this.newItem }];
    this.menuItems.set(updated);
    this.saveMenu(updated);
    this.newItem = { name: '', price: 0, category: '' };
  }

  removeMenuItem(id: number) {
    const updated = this.menuItems().filter(i => i.id !== id);
    this.menuItems.set(updated);
    this.saveMenu(updated);
  }

  // --- Tables ---
  tableCount = signal(10);
  newTableCount = 10;

  loadTables() {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem('tableCount');
    if (saved) {
      this.tableCount.set(+saved);
      this.newTableCount = +saved;
    }
  }

  saveTables() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tableCount', String(this.newTableCount));
      this.tableCount.set(this.newTableCount);
    }
  }

  tables() {
    return Array.from({ length: this.tableCount() }, (_, i) => i + 1);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('loggedIn');
    }
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    // only admin can access this page
    if (isPlatformBrowser(this.platformId)) {
      const loggedIn = localStorage.getItem('loggedIn');
      const currentUser = localStorage.getItem('currentUser');
      if (!loggedIn || currentUser !== 'admin') {
        this.router.navigate(['/login']);
        return;
      }
    }
    this.loadUsers();
    this.loadMenu();
    this.loadTables();
  }
}
