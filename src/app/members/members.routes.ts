import { Routes } from '@angular/router';
import { EditMember } from './features/edit-member/edit-member';
import { MemberList } from './features/member-list/member-list';
import { Members } from './members';

export const memberRoutes: Routes = [
  {
    path: '',
    component: Members,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'list' },
      { path: 'list', component: MemberList },
      { path: 'add', component: EditMember },
      { path: 'edit/:id', component: EditMember },
    ],
  },
];
