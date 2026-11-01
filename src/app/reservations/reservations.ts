import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../data/data';

@Component({
  selector: 'app-reservations',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations {
  ds = inject(DataService);

  form = { name: '', phone: '', date: '', time: '', guests: 2, note: '' };
  success = '';
  error = '';

  submit() {
    if (!this.form.name || !this.form.phone || !this.form.date || !this.form.time) {
      this.error = 'Please fill in all required fields!';
      return;
    }
    this.ds.addReservation({ ...this.form });
    this.success = `Thank you ${this.form.name}! Your table for ${this.form.guests} is booked for ${this.form.date} at ${this.form.time}. We'll confirm shortly.`;
    this.error = '';
    this.form = { name: '', phone: '', date: '', time: '', guests: 2, note: '' };
  }

  today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
