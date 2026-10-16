import { computed, inject, linkedSignal, Service, Signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { School } from '../models/school';
import { SchoolClass } from '../models/school-class';
import { DataService, SaveType } from '../services/data-service';

@Service()
export class SchoolStore {
  private static standardGrades = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];

  private readonly dataService = inject(DataService);

  schools: WritableSignal<School[]>;

  sortedSchools = computed(() =>
    [...this.schools()].sort((s1, s2) => s1.name.localeCompare(s2.name)),
  );

  constructor() {
    this.schools = linkedSignal<School[]>(() =>
      this.dataService.getSignal<School[]>(SaveType.SCHOOLS, [])(),
    );
  }

  replaceSchools$(schools: School[]): Observable<boolean> {
    this.schools.set(schools);
    return this.dataService.update$(SaveType.SCHOOLS, this.schools());
  }

  addSchool$(school: School): Observable<boolean> {
    this.schools.update((schools) => [...schools, school]);
    return this.dataService.update$(SaveType.SCHOOLS, this.schools());
  }

  updateSchool$(school: School): Observable<boolean> {
    this.schools.update((schools) => {
      let index = schools.findIndex((f) => f.id === school.id);
      if (index >= 0) {
        schools.splice(index, 1, { ...school });
      }
      return [...schools];
    });
    return this.dataService.update$(SaveType.SCHOOLS, this.schools());
  }

  removeSchool$(school: School): Observable<boolean> {
    this.schools.update((schools) => {
      let index = schools.indexOf(school);
      if (index >= 0) {
        schools.splice(index, 1);
      }
      return [...schools];
    });
    return this.dataService.update$(SaveType.SCHOOLS, this.schools());
  }

  updateClass$(school: School, schoolClass: SchoolClass): Observable<boolean> {
    let cIndex = school.classes.findIndex((c) => c.id === schoolClass.id);
    if (cIndex >= 0) {
      school.classes.splice(cIndex, 1, { ...schoolClass });
    } else {
      school.classes.push(schoolClass);
    }
    return this.updateSchool$(school);
  }

  removeClass$(school: School, schoolClass: SchoolClass): Observable<boolean> {
    let index = school.classes.indexOf(schoolClass);
    if (index >= 0) {
      school.classes.splice(index, 1);
    }
    return this.updateSchool$(school);
  }

  findSchoolClassObject(
    schoolClassId: string,
  ): Signal<{ school: School; schoolClass: SchoolClass } | undefined> {
    return computed(() => {
      return this.schools()
        .flatMap((s) =>
          s.classes.map((c) => {
            return { school: s, schoolClass: c };
          }),
        )
        .find((o) => o.schoolClass.id === schoolClassId);
    });
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
    return [...grades].sort(
      (g1, g2) => this.standardGrades.indexOf(g1) - this.standardGrades.indexOf(g2),
    );
  }

  static sortedClasses(classes: SchoolClass[]): SchoolClass[] {
    return [...classes].sort((c1, c2) => this.classSortWeight(c1) - this.classSortWeight(c2));
  }

  // Tri des classes (à modifier si on a plus de 5 niveaux possible ou 9 niveaux par classe)
  static classSortWeight(schoolClass: SchoolClass): number {
    const gradeindex = Math.min(...schoolClass.grades.map((g) => this.standardGrades.indexOf(g)));
    return schoolClass.year * -100 + gradeindex * 10 + schoolClass.grades.length;
  }
}
