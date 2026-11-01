import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../data/data';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, RouterLink],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  ds = inject(DataService);

  today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('loggedIn') !== 'true' || localStorage.getItem('currentUser') !== 'admin') {
        this.router.navigate(['/login']);
      }
    }
  }

  cancelledOrders() { return this.ds.orders().filter(o => o.status === 'cancelled').length; }

  avgOrderValue(): number {
    const paid = this.ds.paidOrders();
    if (paid.length === 0) return 0;
    return Math.round(this.ds.todayRevenue() / paid.length);
  }

  topItems() {
    const map: { [key: string]: { qty: number; revenue: number } } = {};
    this.ds.paidOrders().forEach(o => {
      o.items.forEach(i => {
        if (!map[i.menuItem.name]) map[i.menuItem.name] = { qty: 0, revenue: 0 };
        map[i.menuItem.name].qty += i.qty;
        map[i.menuItem.name].revenue += i.menuItem.price * i.qty;
      });
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) { localStorage.removeItem('loggedIn'); localStorage.removeItem('currentUser'); }
    this.router.navigate(['/login']);
  }
}
