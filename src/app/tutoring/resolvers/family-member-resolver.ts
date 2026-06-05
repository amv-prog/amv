import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FamilyStore } from '../stores/family-store';

export const familyMemberResolver: ResolveFn<boolean> = (route) => {
  const id = route.paramMap.get('memberId')!;
  const memberStore = inject(FamilyStore);
  memberStore.setSelectedFamilyMemberId(id);
  return true;
};
