import { computed, inject, linkedSignal, Service, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { VolunteerMember } from '../models/volunteer-member';
import { DataService, SaveType } from '../services/data-service';

@Service()
export class VolunteerStore {
  private readonly dataService = inject(DataService);

  volunteers: WritableSignal<VolunteerMember[]>;

  selectedVolunteerId: WritableSignal<string | undefined> = signal<string | undefined>(undefined);

  sortedVolunteers = computed(() =>
    [...this.volunteers()].sort((v1, v2) => v1.firstName.localeCompare(v2.firstName)),
  );

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
    this.volunteers = linkedSignal<VolunteerMember[]>(() =>
      this.dataService.getSignal<VolunteerMember[]>(SaveType.VOLUNTEERS, [])(),
    );
  }

  replaceVolunteers$(volunteers: VolunteerMember[]): Observable<boolean> {
    this.volunteers.set(volunteers);
    return this.dataService.update$(SaveType.VOLUNTEERS, this.volunteers());
  }

  setSelectedVolunteerId(volunteerId: string | undefined) {
    this.selectedVolunteerId.set(volunteerId);
  }

  addVolunteer$(volunteer: VolunteerMember): Observable<boolean> {
    this.volunteers.update((volunteers) => [...volunteers, volunteer]);
    return this.dataService.update$(SaveType.VOLUNTEERS, this.volunteers());
  }

  updateVolunteer$(volunteer: VolunteerMember): Observable<boolean> {
    this.volunteers.update((volunteers) => {
      let index = volunteers.findIndex((v) => v.id === volunteer.id);
      if (index >= 0) {
        volunteers.splice(index, 1, volunteer);
      }
      return [...volunteers];
    });
    return this.dataService.update$(SaveType.VOLUNTEERS, this.volunteers());
  }

  removeVolunteer$(volunteer: VolunteerMember): Observable<boolean> {
    this.volunteers.update((volunteers) => {
      let index = volunteers.indexOf(volunteer);
      if (index >= 0) {
        volunteers.splice(index, 1);
      }
      return [...volunteers];
    });
    return this.dataService.update$(SaveType.VOLUNTEERS, this.volunteers());
  }
}
