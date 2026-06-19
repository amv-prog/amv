import { effect, inject, Service, signal, WritableSignal } from '@angular/core';
import { LocalStorageService } from '../../shared/services/local-storage-service';
import { Lesson } from '../models/lesson';

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
}
