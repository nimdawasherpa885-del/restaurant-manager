import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'home', renderMode: RenderMode.Client },
  { path: 'signup', renderMode: RenderMode.Client },
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'staff', renderMode: RenderMode.Client },
  { path: 'reports', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
