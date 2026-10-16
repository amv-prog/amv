import { Routes } from '@angular/router';
import { Home } from './home/home';
import { CGU } from './info/cgu/cgu';
import { Info } from './info/info';
import { PrivacyPolicy } from './info/privacy-policy/privacy-policy';
import { PatchNotes } from './patch-notes/patch-notes';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'info', component: Info },
  { path: 'patch-notes', component: PatchNotes },
  { path: 'privacy-policy', component: PrivacyPolicy },
  { path: 'cgu', component: CGU },
  {
    path: 'tutoring',
    loadChildren: () => import('./tutoring/tutoring.routes').then((m) => m.tutoringRoutes),
  },
];
