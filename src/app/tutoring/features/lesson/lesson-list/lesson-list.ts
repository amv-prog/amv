import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DateService } from '../../../../shared/services/date-service';
import { Family } from '../../../models/family';
import { RecipientMember } from '../../../models/recipient-member';
import { VolunteerMember } from '../../../models/volunteer-member';
import { FamilyStore } from '../../../stores/family-store';
import { LessonStore } from '../../../stores/lesson-store';
import { VolunteerStore } from '../../../stores/volunteer-store';

@Component({
  selector: 'amv-lesson-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './lesson-list.html',
})
export class LessonList {
  private readonly familyStore = inject(FamilyStore);
  private readonly volunteerStore = inject(VolunteerStore);
  private readonly lessonStore = inject(LessonStore);
  private readonly dateService = inject(DateService);

  protected readonly daysMap = this.dateService.daysMap;

  protected readonly lessonsToDisplay = computed(() => {
    const studentsMap = this.familyStore.childrenMap();
    const tutorsMap = this.volunteerStore.tutorsMap();

    return this.lessonStore.lessons().map((lesson) => {
      const student = studentsMap.get(lesson.studentId);
      const tutor = tutorsMap.get(lesson.tutorId);

      return { lesson, student, tutor };
    });
  });

  public displayStudentName(
    student: { member: RecipientMember; family: Family } | undefined,
  ): string {
    return !!student ? LessonStore.displayStudentName(student) : 'Inconnu';
  }

  public displayTutorName(volunteer: VolunteerMember | undefined): string {
    return !!volunteer ? LessonStore.displayTutorName(volunteer) : 'Inconnu';
  }
}
