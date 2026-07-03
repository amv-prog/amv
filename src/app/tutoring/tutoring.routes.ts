import { Routes } from '@angular/router';
import { DisplayFamilyMember } from './features/family/display-family-member/display-family-member';
import { DisplayFamily } from './features/family/display-family/display-family';
import { EditFamilyMember } from './features/family/edit-family-member/edit-family-member';
import { EditFamily } from './features/family/edit-family/edit-family';
import { FamilyList } from './features/family/family-list/family-list';
import { EditLesson } from './features/lesson/edit-lesson/edit-lesson';
import { LessonList } from './features/lesson/lesson-list/lesson-list';
import { Settings } from './features/settings/settings';
import { DisplayVolunteer } from './features/volunteer/display-volunteer/display-volunteer';
import { EditVolunteer } from './features/volunteer/edit-volunteer/edit-volunteer';
import { VolunteerList } from './features/volunteer/volunteer-list/volunteer-list';
import { familyMemberResolver } from './resolvers/family-member-resolver';
import { familyResolver } from './resolvers/family-resolver';
import { lessonResolver } from './resolvers/lesson-resolver';
import { volunteerResolver } from './resolvers/volunteer-resolver';
import { Tutoring } from './tutoring';

export const tutoringRoutes: Routes = [
  {
    path: '',
    component: Tutoring,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'family/list' },
      { path: 'settings', component: Settings },
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
            path: 'member/:memberId',
            resolve: { member: familyMemberResolver },
            children: [
              { path: '', component: DisplayFamilyMember },
              {
                path: 'edit',
                component: EditFamilyMember,
              },
              {
                path: 'lesson/add',
                resolve: {
                  lesson: lessonResolver,
                  volunteer: volunteerResolver,
                },
                component: EditLesson,
              },
              {
                path: 'lesson/:lessonId/edit',
                resolve: {
                  lesson: lessonResolver,
                  volunteer: volunteerResolver,
                },
                component: EditLesson,
              },
            ],
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
        path: 'volunteer/:volunteerId',
        resolve: { volunteer: volunteerResolver },
        children: [
          { path: '', component: DisplayVolunteer },
          {
            path: 'edit',
            component: EditVolunteer,
          },
          {
            path: 'lesson/add',
            resolve: {
              lesson: lessonResolver,
              member: familyMemberResolver,
            },
            component: EditLesson,
          },
          {
            path: 'lesson/:lessonId/edit',
            resolve: {
              lesson: lessonResolver,
              member: familyMemberResolver,
            },
            component: EditLesson,
          },
        ],
      },
      {
        path: 'lesson/add',
        resolve: {
          lesson: lessonResolver,
          member: familyMemberResolver,
          volunteer: volunteerResolver,
        },
        component: EditLesson,
      },
      {
        path: 'lesson/list',
        component: LessonList,
      },
      {
        path: 'lesson/:lessonId/edit',
        resolve: {
          lesson: lessonResolver,
          member: familyMemberResolver,
          volunteer: volunteerResolver,
        },
        component: EditLesson,
      },
    ],
  },
];
