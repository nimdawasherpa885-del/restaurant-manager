import { Component, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface OrderItem {
  menuItem: MenuItem;
  qty: number;
}

interface Order {
  id: number;
  tableNumber: number;
  items: OrderItem[];
  status: 'open' | 'paid';
  time: Date;
}

@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  activeTab = signal<'menu' | 'orders' | 'tables'>('menu');

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('loggedIn');
    }
    this.router.navigate(['/login']);
  }

  // --- Menu ---
  menuItems = signal<MenuItem[]>([
    { id: 1, name: 'Burger', price: 8.99, category: 'Main' },
    { id: 2, name: 'Pizza', price: 12.99, category: 'Main' },
    { id: 3, name: 'Salad', price: 6.5, category: 'Starter' },
    { id: 4, name: 'Fries', price: 3.5, category: 'Side' },
    { id: 5, name: 'Coke', price: 2.0, category: 'Drink' },
  ]);

  newItem = { name: '', price: 0, category: '' };

  addMenuItem() {
    if (!this.newItem.name || !this.newItem.price || !this.newItem.category) return;
    this.menuItems.set([...this.menuItems(), { id: Date.now(), ...this.newItem }]);
    this.newItem = { name: '', price: 0, category: '' };
  }

  removeMenuItem(id: number) {
    this.menuItems.set(this.menuItems().filter(i => i.id !== id));
  }

  // --- Orders ---
  orders = signal<Order[]>([]);
  nextOrderId = 1;
  newOrderTable = 1;
  selectedItems: { [menuId: number]: number } = {};

  createOrder() {
    const items: OrderItem[] = this.menuItems()
      .filter(m => this.selectedItems[m.id] > 0)
      .map(m => ({ menuItem: m, qty: this.selectedItems[m.id] }));
    if (items.length === 0) return;
    this.orders.set([...this.orders(), {
      id: this.nextOrderId++,
      tableNumber: this.newOrderTable,
      items,
      status: 'open',
      time: new Date(),
    }]);
    this.selectedItems = {};
  }

  orderTotal(order: Order): number {
    return order.items.reduce((sum, i) => sum + i.menuItem.price * i.qty, 0);
  }

  markPaid(orderId: number) {
    this.orders.set(this.orders().map(o => o.id === orderId ? { ...o, status: 'paid' } : o));
  }

  deleteOrder(orderId: number) {
    this.orders.set(this.orders().filter(o => o.id !== orderId));
  }

  openOrders = computed(() => this.orders().filter(o => o.status === 'open'));
  paidOrders = computed(() => this.orders().filter(o => o.status === 'paid'));

  // --- Tables ---
  tables = signal(Array.from({ length: 10 }, (_, i) => ({ number: i + 1 })));

  tableStatus(tableNum: number): 'free' | 'occupied' {
    return this.openOrders().some(o => o.tableNumber === tableNum) ? 'occupied' : 'free';
  }
}
