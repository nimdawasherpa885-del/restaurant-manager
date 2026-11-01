import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  highlights = [
    { icon: '🏔️', title: 'Mountain View', desc: 'Stunning views of the Himalayas from every table' },
    { icon: '🍵', title: 'Local Flavors', desc: 'Authentic Nepali, Bengali & Tibetan cuisine' },
    { icon: '🌿', title: 'Fresh & Local', desc: 'Ingredients sourced from Lava\'s local farms' },
    { icon: '🔥', title: 'Warm Ambience', desc: 'Cozy fireplace setting perfect for cold mountain nights' },
  ];

  menu = [
    { name: 'Thukpa', price: '₹120', category: 'Tibetan', desc: 'Hot noodle soup with veggies & chicken' },
    { name: 'Momos', price: '₹80', category: 'Nepali', desc: 'Steamed dumplings with spicy chutney' },
    { name: 'Darjeeling Tea', price: '₹40', category: 'Drink', desc: 'Fresh brewed first flush Darjeeling tea' },
    { name: 'Luchi & Alur Dom', price: '₹90', category: 'Bengali', desc: 'Crispy puri with spiced potato curry' },
    { name: 'Sel Roti', price: '₹60', category: 'Nepali', desc: 'Traditional rice flour ring bread' },
    { name: 'Chicken Curry', price: '₹180', category: 'Main', desc: 'Slow cooked mountain style chicken' },
  ];
}
