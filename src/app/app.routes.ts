import { Routes } from '@angular/router';
import { Home } from './home/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'members',
    loadChildren: () => import('./members/members.routes').then((m) => m.memberRoutes),
  },
];
