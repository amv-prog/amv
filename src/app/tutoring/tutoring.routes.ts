import { Routes } from '@angular/router';
import { DisplayFamily } from './features/display-family/display-family';
import { EditFamilyMember } from './features/edit-family-member/edit-family-member';
import { EditFamily } from './features/edit-family/edit-family';
import { EditVolunteer } from './features/edit-volunteer/edit-volunteer';
import { FamilyList } from './features/family-list/family-list';
import { VolunteerList } from './features/volunteer-list/volunteer-list';
import { familyMemberResolver } from './resolvers/family-member-resolver';
import { familyResolver } from './resolvers/family-resolver';
import { volunteerResolver } from './resolvers/volunteer-resolver';
import { Tutoring } from './tutoring';

export const tutoringRoutes: Routes = [
  {
    path: '',
    component: Tutoring,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'family/list' },
      { path: 'family/add', resolve: { family: familyResolver }, component: EditFamily },
      { path: 'family/list', component: FamilyList },
      {
        path: 'family/:familyId',
        resolve: { family: familyResolver },
        children: [
          { path: '', component: DisplayFamily },
          {
            path: 'edit',
            component: EditFamily,
          },
          {
            path: 'member/add',
            resolve: { member: familyMemberResolver },
            component: EditFamilyMember,
          },
          {
            path: 'member/:memberId/edit',
            resolve: { member: familyMemberResolver },
            component: EditFamilyMember,
          },
        ],
      },
      {
        path: 'volunteer/add',
        resolve: { volunteer: volunteerResolver },
        component: EditVolunteer,
      },
      { path: 'volunteer/list', component: VolunteerList },
      {
        path: 'volunteer/:volunteerId/edit',
        resolve: { volunteer: volunteerResolver },
        component: EditVolunteer,
      },
    ],
  },
];
