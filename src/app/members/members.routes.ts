import { Routes } from '@angular/router';
import { AddMember } from './features/add-member/add-member';
import { MemberList } from './features/member-list/member-list';
import { Members } from './members';

export const memberRoutes: Routes = [
  {
    path: '',
    component: Members,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'list' },
      { path: 'list', component: MemberList },
      { path: 'add', component: AddMember },
    ],
  },
];
