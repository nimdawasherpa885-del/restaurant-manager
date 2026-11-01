import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { Home } from './home/home';
import { Admin } from './admin/admin';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

const authGuard = () => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformBrowser(platformId)) {
    if (localStorage.getItem('loggedIn') === 'true') return true;
  }
  return false;
};

const adminGuard = () => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformBrowser(platformId)) {
    if (localStorage.getItem('loggedIn') === 'true' && localStorage.getItem('currentUser') === 'admin') return true;
  }
  return false;
};

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'admin', component: Admin, canActivate: [adminGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
