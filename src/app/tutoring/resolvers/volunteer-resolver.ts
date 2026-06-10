import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { VolunteerStore } from '../stores/volunteer-store';

export const volunteerResolver: ResolveFn<boolean> = (route) => {
  const id = route.paramMap.get('volunteerId')!;
  const volunteerStore = inject(VolunteerStore);
  volunteerStore.setSelectedVolunteerId(id);
  return true;
};
