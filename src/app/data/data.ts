import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  available: boolean;
}

export interface OrderItem {
  menuItem: MenuItem;
  qty: number;
  note: string;
}

export interface Order {
  id: number;
  tableNumber: number;
  waiter: string;
  items: OrderItem[];
  status: 'open' | 'paid' | 'cancelled';
  discount: number;
  time: Date;
  kotSent: boolean;
}

export interface Reservation {
  id: number;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  note: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  gstPercent: number;
  currency: string;
  openTime: string;
  closeTime: string;
  tableCount: number;
}

const DEFAULT_SETTINGS: RestaurantSettings = {
  name: 'Himalayan Bites',
  tagline: 'Where the mountains meet the flavors',
  address: 'Near Lava Forest Bungalow, Lava, Kalimpong, West Bengal — 734314',
  phone: '+91 98300 00000',
  email: 'himalayanbites@lava.in',
  gstNumber: '19ABCDE1234F1Z5',
  gstPercent: 5,
  currency: '₹',
  openTime: '07:00',
  closeTime: '22:00',
  tableCount: 10,
};

const DEFAULT_MENU: MenuItem[] = [
  { id: 1, name: 'Thukpa', price: 120, category: 'Main', description: 'Hot noodle soup with veggies & chicken', available: true },
  { id: 2, name: 'Momos (Veg)', price: 80, category: 'Starter', description: 'Steamed dumplings with spicy chutney', available: true },
  { id: 3, name: 'Momos (Chicken)', price: 100, category: 'Starter', description: 'Chicken dumplings with chutney', available: true },
  { id: 4, name: 'Chicken Curry', price: 180, category: 'Main', description: 'Slow cooked mountain style chicken', available: true },
  { id: 5, name: 'Luchi & Alur Dom', price: 90, category: 'Bengali', description: 'Crispy puri with spiced potato curry', available: true },
  { id: 6, name: 'Sel Roti', price: 60, category: 'Nepali', description: 'Traditional rice flour ring bread', available: true },
  { id: 7, name: 'Veg Fried Rice', price: 110, category: 'Main', description: 'Wok tossed rice with vegetables', available: true },
  { id: 8, name: 'Egg Curry', price: 130, category: 'Main', description: 'Boiled eggs in spiced gravy', available: true },
  { id: 9, name: 'Darjeeling Tea', price: 40, category: 'Drink', description: 'Fresh brewed first flush Darjeeling tea', available: true },
  { id: 10, name: 'Black Coffee', price: 50, category: 'Drink', description: 'Strong mountain brewed coffee', available: true },
  { id: 11, name: 'Lassi', price: 60, category: 'Drink', description: 'Sweet or salted yogurt drink', available: true },
  { id: 12, name: 'Gulab Jamun', price: 70, category: 'Dessert', description: 'Soft milk dumplings in sugar syrup', available: true },
];

@Injectable({ providedIn: 'root' })
export class DataService {
  private platformId = inject(PLATFORM_ID);

  // --- Settings ---
  settings = signal<RestaurantSettings>(DEFAULT_SETTINGS);

  // --- Menu ---
  menuItems = signal<MenuItem[]>([]);

  // --- Orders ---
  orders = signal<Order[]>([]);
  private nextOrderId = 1;

  // --- Reservations ---
  reservations = signal<Reservation[]>([]);

  // --- Computed ---
  openOrders = computed(() => this.orders().filter(o => o.status === 'open'));
  paidOrders = computed(() => this.orders().filter(o => o.status === 'paid'));
  todayRevenue = computed(() =>
    this.paidOrders().reduce((sum, o) => sum + this.orderTotal(o), 0)
  );

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAll();
    }
  }

  private loadAll() {
    // settings
    const s = localStorage.getItem('rm_settings');
    if (s) this.settings.set(JSON.parse(s));

    // menu
    const m = localStorage.getItem('rm_menu');
    this.menuItems.set(m ? JSON.parse(m) : DEFAULT_MENU);
    if (!m) this.save('rm_menu', DEFAULT_MENU);

    // orders
    const o = localStorage.getItem('rm_orders');
    if (o) {
      const parsed: Order[] = JSON.parse(o).map((ord: Order) => ({ ...ord, time: new Date(ord.time) }));
      this.orders.set(parsed);
      this.nextOrderId = parsed.length > 0 ? Math.max(...parsed.map(x => x.id)) + 1 : 1;
    }

    // reservations
    const r = localStorage.getItem('rm_reservations');
    if (r) this.reservations.set(JSON.parse(r));
  }

  private save(key: string, data: any) {
    if (isPlatformBrowser(this.platformId)) localStorage.setItem(key, JSON.stringify(data));
  }

  // Settings
  saveSettings(s: RestaurantSettings) {
    this.settings.set({ ...s });
    this.save('rm_settings', s);
  }

  // Menu
  addMenuItem(item: Omit<MenuItem, 'id'>) {
    const updated = [...this.menuItems(), { id: Date.now(), ...item }];
    this.menuItems.set(updated);
    this.save('rm_menu', updated);
  }

  updateMenuItem(id: number, changes: Partial<MenuItem>) {
    const updated = this.menuItems().map(m => m.id === id ? { ...m, ...changes } : m);
    this.menuItems.set(updated);
    this.save('rm_menu', updated);
  }

  removeMenuItem(id: number) {
    const updated = this.menuItems().filter(m => m.id !== id);
    this.menuItems.set(updated);
    this.save('rm_menu', updated);
  }

  // Orders
  createOrder(tableNumber: number, waiter: string, items: OrderItem[], discount = 0): Order {
    const order: Order = {
      id: this.nextOrderId++,
      tableNumber,
      waiter,
      items,
      status: 'open',
      discount,
      time: new Date(),
      kotSent: false,
    };
    const updated = [...this.orders(), order];
    this.orders.set(updated);
    this.save('rm_orders', updated);
    return order;
  }

  updateOrderStatus(id: number, status: 'open' | 'paid' | 'cancelled') {
    const updated = this.orders().map(o => o.id === id ? { ...o, status } : o);
    this.orders.set(updated);
    this.save('rm_orders', updated);
  }

  sendKOT(id: number) {
    const updated = this.orders().map(o => o.id === id ? { ...o, kotSent: true } : o);
    this.orders.set(updated);
    this.save('rm_orders', updated);
  }

  updateDiscount(id: number, discount: number) {
    const updated = this.orders().map(o => o.id === id ? { ...o, discount } : o);
    this.orders.set(updated);
    this.save('rm_orders', updated);
  }

  deleteOrder(id: number) {
    const updated = this.orders().filter(o => o.id !== id);
    this.orders.set(updated);
    this.save('rm_orders', updated);
  }

  orderSubtotal(order: Order): number {
    return order.items.reduce((sum, i) => sum + i.menuItem.price * i.qty, 0);
  }

  orderTax(order: Order): number {
    const sub = this.orderSubtotal(order) - (order.discount || 0);
    return Math.round(sub * this.settings().gstPercent / 100);
  }

  orderTotal(order: Order): number {
    return this.orderSubtotal(order) - (order.discount || 0) + this.orderTax(order);
  }

  // Reservations
  addReservation(r: Omit<Reservation, 'id' | 'status'>): Reservation {
    const res: Reservation = { id: Date.now(), ...r, status: 'pending' };
    const updated = [...this.reservations(), res];
    this.reservations.set(updated);
    this.save('rm_reservations', updated);
    return res;
  }

  updateReservationStatus(id: number, status: 'pending' | 'confirmed' | 'cancelled') {
    const updated = this.reservations().map(r => r.id === id ? { ...r, status } : r);
    this.reservations.set(updated);
    this.save('rm_reservations', updated);
  }

  tableStatus(tableNum: number): 'free' | 'occupied' {
    return this.openOrders().some(o => o.tableNumber === tableNum) ? 'occupied' : 'free';
  }
}
