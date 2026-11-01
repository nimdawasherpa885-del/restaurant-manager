import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../data/data';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  ds = inject(DataService);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('loggedIn') !== 'true' || localStorage.getItem('currentUser') !== 'admin') {
        this.router.navigate(['/login']);
      }
    }
  }

  pendingReservations() { return this.ds.reservations().filter(r => r.status === 'pending').length; }
  totalMenuItems() { return this.ds.menuItems().length; }
  availableMenuItems() { return this.ds.menuItems().filter(m => m.available).length; }
  cancelledOrders() { return this.ds.orders().filter(o => o.status === 'cancelled').length; }

  topItems() {
    const map: { [key: string]: { qty: number; revenue: number } } = {};
    this.ds.paidOrders().forEach(o => {
      o.items.forEach(i => {
        if (!map[i.menuItem.name]) map[i.menuItem.name] = { qty: 0, revenue: 0 };
        map[i.menuItem.name].qty += i.qty;
        map[i.menuItem.name].revenue += i.menuItem.price * i.qty;
      });
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }

  recentOrders() { return [...this.ds.orders()].reverse().slice(0, 6); }

  logout() {
    if (isPlatformBrowser(this.platformId)) { localStorage.removeItem('loggedIn'); localStorage.removeItem('currentUser'); }
    this.router.navigate(['/login']);
  }
}
