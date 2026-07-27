import { computed, effect, inject, Service, signal, WritableSignal } from '@angular/core';
import { LocalStorageService } from '../../shared/services/local-storage-service';
import { School } from '../models/school';
import { SchoolClass } from '../models/school-class';

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

  updateClass(school: School, schoolClass: SchoolClass) {
    let cIndex = school.classes.findIndex((c) => c.id === schoolClass.id);
    if (cIndex >= 0) {
      school.classes.splice(cIndex, 1, { ...schoolClass });
    } else {
      school.classes.push(schoolClass);
    }
    this.updateSchool(school);
  }

  // Année scolaire en cours. L'année suivante est remontée à partir de juillet.
  static currentSchoolYear(): number {
    const date = new Date();
    const year = date.getFullYear();
    if (date.getMonth() >= 6) {
      return year;
    } else {
      return year - 1;
    }
  }

  static sortedGrades(grades: string[]): string[] {
    const standardGrades = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
    return [...grades].sort((g1, g2) => standardGrades.indexOf(g2) - standardGrades.indexOf(g1));
  }
}
