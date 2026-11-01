import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Reservation {
  id: number;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  note: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

@Component({
  selector: 'app-reservations',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations {
  private platformId = inject(PLATFORM_ID);

  form = { name: '', phone: '', date: '', time: '', guests: 2, note: '' };
  success = '';
  error = '';

  reservations = signal<Reservation[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('reservations');
      if (saved) this.reservations.set(JSON.parse(saved));
    }
  }

  submit() {
    if (!this.form.name || !this.form.phone || !this.form.date || !this.form.time) {
      this.error = 'Please fill in all required fields!';
      return;
    }
    const newRes: Reservation = {
      id: Date.now(),
      ...this.form,
      status: 'pending',
    };
    const updated = [...this.reservations(), newRes];
    this.reservations.set(updated);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('reservations', JSON.stringify(updated));
    }
    this.success = `Thank you ${this.form.name}! Your table for ${this.form.guests} is booked for ${this.form.date} at ${this.form.time}. We'll confirm shortly.`;
    this.error = '';
    this.form = { name: '', phone: '', date: '', time: '', guests: 2, note: '' };
  }

  today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
