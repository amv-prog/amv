import { computed, effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { LocalStorageService } from '../../shared/services/local-storage-service';
import { VolunteerMember } from '../models/volunteer-member';

@Injectable({
  providedIn: 'root',
})
export class VolunteerStore {
  private readonly localStorage = inject(LocalStorageService);

  volunteers: WritableSignal<VolunteerMember[]>;

  selectedVolunteerId: WritableSignal<string | undefined> = signal<string | undefined>(undefined);

  selectedVolunteer = computed(() => {
    const volunteerId = this.selectedVolunteerId();
    if (!!volunteerId) {
      return this.volunteers().find((v) => v.id === volunteerId);
    } else {
      return undefined;
    }
  });

  tutorsMap = computed(() => {
    const volunteers = this.volunteers();
    return new Map(
      volunteers
        .filter((volunteer) => volunteer.isTutor)
        .map((volunteer) => [volunteer.id, volunteer]),
    );
  });

  constructor() {
    this.volunteers = signal<VolunteerMember[]>(
      this.localStorage.getItem<VolunteerMember[]>('volunteers') || [],
    );

    effect(() => {
      this.localStorage.setItem('volunteers', this.volunteers());
    });
  }

  replaceVolunteers(volunteers: VolunteerMember[]) {
    this.volunteers.set(volunteers);
  }

  setSelectedVolunteerId(volunteerId: string | undefined) {
    this.selectedVolunteerId.set(volunteerId);
  }

  addVolunteer(volunteer: VolunteerMember) {
    this.volunteers.update((volunteers) => [...volunteers, volunteer]);
  }

  updateVolunteer(volunteer: VolunteerMember) {
    this.volunteers.update((volunteers) => {
      let index = volunteers.findIndex((v) => v.id === volunteer.id);
      if (index >= 0) {
        volunteers.splice(index, 1, volunteer);
      }
      return [...volunteers];
    });
  }

  removeVolunteer(volunteer: VolunteerMember) {
    this.volunteers.update((volunteers) => {
      let index = volunteers.indexOf(volunteer);
      if (index >= 0) {
        volunteers.splice(index, 1);
      }
      return [...volunteers];
    });
  }
}
