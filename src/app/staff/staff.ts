import { Component, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

interface StaffMember {
  id: number;
  name: string;
  role: string;
  phone: string;
  shift: string;
  status: 'active' | 'off';
}

@Component({
  selector: 'app-staff',
  imports: [FormsModule, CommonModule],
  templateUrl: './staff.html',
  styleUrl: './staff.css',
})
export class Staff implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  staff = signal<StaffMember[]>([
    { id: 1, name: 'Raju Tamang', role: 'Head Chef', phone: '98300 11111', shift: 'Morning', status: 'active' },
    { id: 2, name: 'Sita Rai', role: 'Waiter', phone: '98300 22222', shift: 'Evening', status: 'active' },
    { id: 3, name: 'Bikash Gurung', role: 'Cashier', phone: '98300 33333', shift: 'Morning', status: 'active' },
    { id: 4, name: 'Priya Sharma', role: 'Waiter', phone: '98300 44444', shift: 'Evening', status: 'off' },
  ]);

  newStaff = { name: '', role: '', phone: '', shift: 'Morning' };
  showForm = false;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('loggedIn') !== 'true' || localStorage.getItem('currentUser') !== 'admin') {
        this.router.navigate(['/login']);
      }
      const saved = localStorage.getItem('staff');
      if (saved) this.staff.set(JSON.parse(saved));
    }
  }

  save(list: StaffMember[]) {
    if (isPlatformBrowser(this.platformId)) localStorage.setItem('staff', JSON.stringify(list));
  }

  addStaff() {
    if (!this.newStaff.name || !this.newStaff.role) return;
    const updated = [...this.staff(), { id: Date.now(), ...this.newStaff, status: 'active' as const }];
    this.staff.set(updated);
    this.save(updated);
    this.newStaff = { name: '', role: '', phone: '', shift: 'Morning' };
    this.showForm = false;
  }

  toggleStatus(id: number) {
    const updated = this.staff().map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'off' as const : 'active' as const } : s);
    this.staff.set(updated);
    this.save(updated);
  }

  deleteStaff(id: number) {
    const updated = this.staff().filter(s => s.id !== id);
    this.staff.set(updated);
    this.save(updated);
  }

  activeCount() { return this.staff().filter(s => s.status === 'active').length; }

  logout() {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem('loggedIn');
    this.router.navigate(['/login']);
  }
}
