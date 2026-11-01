import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { DataService, Order, OrderItem } from '../data/data';

@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  ds = inject(DataService);

  activeTab = signal<'orders' | 'menu' | 'tables' | 'kot'>('orders');

  // current logged in user as waiter name
  waiterName = isPlatformBrowser(this.platformId) ? (localStorage.getItem('currentUser') || 'Staff') : 'Staff';

  // --- New Order Form ---
  newOrderTable = 1;
  newOrderDiscount = 0;
  selectedItems: { [menuId: number]: { qty: number; note: string } } = {};

  getQty(id: number) { return this.selectedItems[id]?.qty || 0; }
  getNote(id: number) { return this.selectedItems[id]?.note || ''; }

  setQty(id: number, qty: number) {
    if (!this.selectedItems[id]) this.selectedItems[id] = { qty: 0, note: '' };
    this.selectedItems[id].qty = qty < 0 ? 0 : qty;
  }

  setNote(id: number, note: string) {
    if (!this.selectedItems[id]) this.selectedItems[id] = { qty: 0, note: '' };
    this.selectedItems[id].note = note;
  }

  orderItemCount() {
    return Object.values(this.selectedItems).filter(v => v.qty > 0).length;
  }

  createOrder() {
    const items: OrderItem[] = this.ds.menuItems()
      .filter(m => this.selectedItems[m.id]?.qty > 0)
      .map(m => ({ menuItem: m, qty: this.selectedItems[m.id].qty, note: this.selectedItems[m.id].note || '' }));
    if (items.length === 0) return;
    this.ds.createOrder(this.newOrderTable, this.waiterName, items, this.newOrderDiscount);
    this.selectedItems = {};
    this.newOrderDiscount = 0;
    this.activeTab.set('orders');
  }

  // --- Bill view ---
  selectedOrder: Order | null = null;

  viewBill(order: Order) {
    this.selectedOrder = order;
  }

  closeBill() { this.selectedOrder = null; }

  printBill() { window.print(); }

  categories() {
    return [...new Set(this.ds.menuItems().filter(m => m.available).map(m => m.category))];
  }

  menuByCategory(cat: string) {
    return this.ds.menuItems().filter(m => m.category === cat && m.available);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('currentUser');
    }
    this.router.navigate(['/login']);
  }
}
