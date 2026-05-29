import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Info } from './info/info';
import { PatchNotes } from './patch-notes/patch-notes';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'info', component: Info },
  { path: 'patch-notes', component: PatchNotes },
  {
    path: 'tutoring',
    loadChildren: () => import('./tutoring/tutoring.routes').then((m) => m.tutoringRoutes),
  },
];
