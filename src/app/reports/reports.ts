import { Component, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

interface Order {
  id: number;
  tableNumber: number;
  items: { menuItem: { name: string; price: number }; qty: number }[];
  status: string;
  time: string;
}

@Component({
  selector: 'app-reports',
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  orders = signal<Order[]>([]);
  today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('loggedIn') !== 'true' || localStorage.getItem('currentUser') !== 'admin') {
        this.router.navigate(['/login']);
        return;
      }
    }
    // sample orders for demo
    this.orders.set([
      { id: 1, tableNumber: 3, items: [{ menuItem: { name: 'Momos', price: 80 }, qty: 2 }, { menuItem: { name: 'Darjeeling Tea', price: 40 }, qty: 2 }], status: 'paid', time: '08:30 AM' },
      { id: 2, tableNumber: 1, items: [{ menuItem: { name: 'Thukpa', price: 120 }, qty: 1 }, { menuItem: { name: 'Sel Roti', price: 60 }, qty: 2 }], status: 'paid', time: '09:15 AM' },
      { id: 3, tableNumber: 5, items: [{ menuItem: { name: 'Chicken Curry', price: 180 }, qty: 2 }, { menuItem: { name: 'Luchi & Alur Dom', price: 90 }, qty: 1 }], status: 'paid', time: '12:45 PM' },
      { id: 4, tableNumber: 2, items: [{ menuItem: { name: 'Momos', price: 80 }, qty: 3 }], status: 'open', time: '01:30 PM' },
    ]);
  }

  orderTotal(order: Order): number {
    return order.items.reduce((sum, i) => sum + i.menuItem.price * i.qty, 0);
  }

  totalRevenue(): number {
    return this.orders().filter(o => o.status === 'paid').reduce((sum, o) => sum + this.orderTotal(o), 0);
  }

  paidCount(): number { return this.orders().filter(o => o.status === 'paid').length; }
  openCount(): number { return this.orders().filter(o => o.status === 'open').length; }

  topItems(): { name: string; qty: number; revenue: number }[] {
    const map: { [key: string]: { qty: number; revenue: number } } = {};
    this.orders().forEach(o => {
      o.items.forEach(i => {
        if (!map[i.menuItem.name]) map[i.menuItem.name] = { qty: 0, revenue: 0 };
        map[i.menuItem.name].qty += i.qty;
        map[i.menuItem.name].revenue += i.menuItem.price * i.qty;
      });
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.qty - a.qty);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem('loggedIn');
    this.router.navigate(['/login']);
  }
}
