import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { LessonStore } from '../stores/lesson-store';

export const lessonResolver: ResolveFn<boolean> = (route, state) => {
  const id = route.paramMap.get('lessonId')!;
  const lessonStore = inject(LessonStore);
  lessonStore.setSelectedLessonId(id);
  return true;
};
