import { effect, inject, Service, signal, WritableSignal } from '@angular/core';
import { LocalStorageService } from '../../shared/services/local-storage-service';
import { Family } from '../models/family';
import { Lesson } from '../models/lesson';
import { RecipientMember } from '../models/recipient-member';
import { VolunteerMember } from '../models/volunteer-member';

@Service()
export class LessonStore {
  private readonly localStorage = inject(LocalStorageService);

  lessons: WritableSignal<Lesson[]>;

  constructor() {
    this.lessons = signal<Lesson[]>(this.localStorage.getItem<Lesson[]>('lessons') || []);

    effect(() => {
      this.localStorage.setItem('lessons', this.lessons());
    });
  }

  addLesson(lesson: Lesson) {
    this.lessons.update((lessons) => [...lessons, lesson]);
  }

  public static displayStudentName(student: { member: RecipientMember; family: Family }): string {
    const displayedFamilyName =
      student.member.lastName === student.family.name ? '' : ` (${student.family.name})`;
    return `${student.member.firstName} ${student.member.lastName}${displayedFamilyName}`;
  }

  public static displayTutorName(volunteer: VolunteerMember): string {
    return `${volunteer.firstName} ${volunteer.lastName}`;
  }
}
