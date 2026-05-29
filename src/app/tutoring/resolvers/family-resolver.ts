import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FamilyStore } from '../stores/family-store';

export const familyResolver: ResolveFn<boolean> = (route) => {
  const id = route.paramMap.get('familyId')!;
  const memberStore = inject(FamilyStore);
  if (!!id) {
    memberStore.setSelectedFamily(memberStore.families().find((f) => f.id === id));
  } else {
    memberStore.setSelectedFamily(undefined);
  }
  return true;
};
