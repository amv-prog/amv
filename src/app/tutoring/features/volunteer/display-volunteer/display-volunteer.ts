import { Dialog } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { DateService } from '../../../../shared/services/date-service';
import { Family } from '../../../models/family';
import { Lesson } from '../../../models/lesson';
import { RecipientMember } from '../../../models/recipient-member';
import { FamilyStore } from '../../../stores/family-store';
import { LessonStore } from '../../../stores/lesson-store';
import { VolunteerStore } from '../../../stores/volunteer-store';

@Component({
  selector: 'amv-display-volunteer',
  imports: [DatePipe, RouterLink],
  templateUrl: './display-volunteer.html',
})
export class DisplayVolunteer {
  private readonly lessonStore = inject(LessonStore);
  private readonly volunteerStore = inject(VolunteerStore);
  private readonly familyStore = inject(FamilyStore);
  private readonly dateService = inject(DateService);
  private readonly router = inject(Router);

  private readonly dialog = inject(Dialog);

  protected readonly daysMap = this.dateService.daysMap;

  protected readonly volunteer = this.volunteerStore.selectedVolunteer;

  protected readonly studentsMap = this.familyStore.childrenMap;

  protected readonly currentLessonsToDisplay = computed(() => {
    const studentsMap = this.familyStore.childrenMap();

    return this.lessonStore
      .lessons()
      .filter((lesson) => lesson.tutorId === this.volunteer()?.id)
      .filter((lesson) => {
        return !lesson.endDate || DateService.compareDays(lesson.endDate, new Date()) >= 0;
      })
      .filter((lesson) => {
        return DateService.compareDays(lesson.startDate, new Date()) <= 0;
      })
      .sort(LessonStore.compareLessonsDays)
      .map((lesson) => {
        const student = studentsMap.get(lesson.studentId);

        return { lesson, student };
      });
  });

  protected readonly pastLessonsToDisplay = computed(() => {
    const studentsMap = this.familyStore.childrenMap();

    return this.lessonStore
      .lessons()
      .filter((lesson) => lesson.tutorId === this.volunteer()?.id)
      .filter((lesson) => {
        return !!lesson.endDate && DateService.compareDays(lesson.endDate, new Date()) < 0;
      })
      .sort(
        (l1, l2) =>
          LessonStore.compareLessonsEndDate(l1, l2) || LessonStore.compareLessonsDays(l1, l2),
      )
      .map((lesson) => {
        const student = studentsMap.get(lesson.studentId);

        return { lesson, student };
      });
  });

  protected readonly futureLessonsToDisplay = computed(() => {
    const studentsMap = this.familyStore.childrenMap();

    return this.lessonStore
      .lessons()
      .filter((lesson) => lesson.tutorId === this.volunteer()?.id)
      .filter((lesson) => {
        return DateService.compareDays(lesson.startDate, new Date()) > 0;
      })
      .sort(
        (l1, l2) =>
          LessonStore.compareLessonsStartDate(l1, l2) || LessonStore.compareLessonsDays(l1, l2),
      )
      .map((lesson) => {
        const student = studentsMap.get(lesson.studentId);

        return { lesson, student };
      });
  });

  public displayStudentName(
    student: { member: RecipientMember; family: Family } | undefined,
  ): string {
    return !!student ? LessonStore.displayStudentName(student) : 'Inconnu';
  }

  public validateVolunteerRemoval() {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: `Souhaitez-vous supprimer ${this.volunteer()!.firstName} ${this.volunteer()!.lastName} ?`,
      },
    });

    dialogRef.closed
      .pipe(
        tap((result) => {
          if (!!result) {
            this.removeVolunteer();
          }
        }),
      )
      .subscribe();
  }

  private removeVolunteer() {
    this.volunteerStore.removeVolunteer(this.volunteer()!);
    this.router.navigate(['tutoring', 'volunteer', 'list']);
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
