import { Dialog } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { DateService } from '../../../../shared/services/date-service';
import { Family } from '../../../models/family';
import { Lesson } from '../../../models/lesson';
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

  protected readonly currentLessonsToDisplay = computed(() => {
    const studentsMap = this.familyStore.childrenMap();
    const tutorsMap = this.volunteerStore.tutorsMap();

    return this.lessonStore
      .lessons()
      .filter((lesson) => {
        return !lesson.endDate || DateService.compareDays(lesson.endDate, new Date()) >= 0;
      })
      .filter((lesson) => {
        return DateService.compareDays(lesson.startDate, new Date()) <= 0;
      })
      .sort(LessonStore.compareLessonsDays)
      .map((lesson) => {
        const student = studentsMap.get(lesson.studentId);
        const tutor = tutorsMap.get(lesson.tutorId);

        return { lesson, student, tutor };
      });
  });

  protected readonly pastLessonsToDisplay = computed(() => {
    const studentsMap = this.familyStore.childrenMap();
    const tutorsMap = this.volunteerStore.tutorsMap();

    return this.lessonStore
      .lessons()
      .filter((lesson) => {
        return !!lesson.endDate && DateService.compareDays(lesson.endDate, new Date()) < 0;
      })
      .sort(
        (l1, l2) =>
          LessonStore.compareLessonsEndDate(l1, l2) || LessonStore.compareLessonsDays(l1, l2),
      )
      .map((lesson) => {
        const student = studentsMap.get(lesson.studentId);
        const tutor = tutorsMap.get(lesson.tutorId);

        return { lesson, student, tutor };
      });
  });

  protected readonly futureLessonsToDisplay = computed(() => {
    const studentsMap = this.familyStore.childrenMap();
    const tutorsMap = this.volunteerStore.tutorsMap();

    return this.lessonStore
      .lessons()
      .filter((lesson) => {
        return DateService.compareDays(lesson.startDate, new Date()) > 0;
      })
      .sort(
        (l1, l2) =>
          LessonStore.compareLessonsStartDate(l1, l2) || LessonStore.compareLessonsDays(l1, l2),
      )
      .map((lesson) => {
        const student = studentsMap.get(lesson.studentId);
        const tutor = tutorsMap.get(lesson.tutorId);

        return { lesson, student, tutor };
      });
  });

  private readonly dialog = inject(Dialog);

  public displayStudentName(
    student: { member: RecipientMember; family: Family } | undefined,
  ): string {
    return !!student ? LessonStore.displayStudentName(student) : 'Inconnu';
  }

  public displayTutorName(volunteer: VolunteerMember | undefined): string {
    return !!volunteer ? LessonStore.displayTutorName(volunteer) : 'Inconnu';
  }

  stopLesson(lesson: Lesson) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.lessonStore.updateLesson({ ...lesson, endDate: this.dateService.formatDate(today) });
  }

  reactivateLesson(lesson: Lesson) {
    this.lessonStore.updateLesson({ ...lesson, endDate: undefined });
  }

  canStopLesson(lesson: Lesson) {
    return !lesson.endDate || DateService.stringToDate(lesson.endDate)! > new Date();
  }

  public validateLessonRemoval(lesson: Lesson) {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: `Souhaitez-vous supprimer ce cours ? Attention, il n'apparaîtra plus dans l'historique.`,
      },
    });

    dialogRef.closed
      .pipe(
        tap((result) => {
          if (!!result) {
            this.removeLesson(lesson);
          }
        }),
      )
      .subscribe();
  }

  private removeLesson(lesson: Lesson) {
    this.lessonStore.removeLesson(lesson);
  }
}
