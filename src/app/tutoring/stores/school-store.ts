import { computed, effect, inject, Service, signal, WritableSignal } from '@angular/core';
import { LocalStorageService } from '../../shared/services/local-storage-service';
import { School } from '../models/school';

@Service()
export class SchoolStore {
  private readonly localStorage = inject(LocalStorageService);

  schools: WritableSignal<School[]>;

  sortedSchools = computed(() =>
    [...this.schools()].sort((s1, s2) => s1.name.localeCompare(s2.name)),
  );

  constructor() {
    this.schools = signal<School[]>(this.localStorage.getItem<School[]>('schools') || []);

    effect(() => {
      this.localStorage.setItem('schools', this.schools());
    });
  }

  replaceSchools(schools: School[]) {
    this.schools.set(schools);
  }

  addSchool(school: School) {
    this.schools.update((schools) => [...schools, school]);
  }

  updateSchool(school: School) {
    this.schools.update((schools) => {
      let index = schools.findIndex((f) => f.id === school.id);
      if (index >= 0) {
        schools.splice(index, 1, { ...school });
      }
      return [...schools];
    });
  }
}
