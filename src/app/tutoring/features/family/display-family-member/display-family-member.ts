import { Dialog } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { DateService } from '../../../../shared/services/date-service';
import { Lesson } from '../../../models/lesson';
import { VolunteerMember } from '../../../models/volunteer-member';
import { FamilyStore } from '../../../stores/family-store';
import { LessonStore } from '../../../stores/lesson-store';
import { VolunteerStore } from '../../../stores/volunteer-store';

@Component({
  selector: 'amv-display-family-member',
  imports: [DatePipe, RouterLink],
  templateUrl: './display-family-member.html',
})
export class DisplayFamilyMember {
  private readonly familyStore = inject(FamilyStore);
  private readonly lessonStore = inject(LessonStore);
  private readonly volunteerStore = inject(VolunteerStore);
  private readonly dateService = inject(DateService);
  private readonly router = inject(Router);

  private readonly dialog = inject(Dialog);

  protected readonly daysMap = this.dateService.daysMap;

  protected readonly member = this.familyStore.selectedFamilyMember;
  protected readonly family = this.familyStore.selectedFamily;

  protected readonly currentLessonsToDisplay = computed(() => {
    const tutorsMap = this.volunteerStore.tutorsMap();

    return this.lessonStore
      .lessons()
      .filter((lesson) => lesson.studentId === this.member()?.id)
      .filter((lesson) => {
        return !lesson.endDate || DateService.compareDays(lesson.endDate, new Date()) >= 0;
      })
      .filter((lesson) => {
        return DateService.compareDays(lesson.startDate, new Date()) <= 0;
      })
      .sort(LessonStore.compareLessonsDays)
      .map((lesson) => {
        const tutor = tutorsMap.get(lesson.tutorId);

        return { lesson, tutor };
      });
  });

  protected readonly pastLessonsToDisplay = computed(() => {
    const tutorsMap = this.volunteerStore.tutorsMap();

    return this.lessonStore
      .lessons()
      .filter((lesson) => lesson.studentId === this.member()?.id)
      .filter((lesson) => {
        return !!lesson.endDate && DateService.compareDays(lesson.endDate, new Date()) < 0;
      })
      .sort(
        (l1, l2) =>
          LessonStore.compareLessonsEndDate(l1, l2) || LessonStore.compareLessonsDays(l1, l2),
      )
      .map((lesson) => {
        const tutor = tutorsMap.get(lesson.tutorId);

        return { lesson, tutor };
      });
  });

  protected readonly futureLessonsToDisplay = computed(() => {
    const tutorsMap = this.volunteerStore.tutorsMap();

    return this.lessonStore
      .lessons()
      .filter((lesson) => lesson.studentId === this.member()?.id)
      .filter((lesson) => {
        return DateService.compareDays(lesson.startDate, new Date()) > 0;
      })
      .sort(
        (l1, l2) =>
          LessonStore.compareLessonsStartDate(l1, l2) || LessonStore.compareLessonsDays(l1, l2),
      )
      .map((lesson) => {
        const tutor = tutorsMap.get(lesson.tutorId);

        return { lesson, tutor };
      });
  });

  public displayTutorName(volunteer: VolunteerMember | undefined): string {
    return !!volunteer ? LessonStore.displayTutorName(volunteer) : 'Inconnu';
  }

  goToFamily() {
    this.router.navigate(['tutoring', 'family', this.family()?.id]);
  }

  public validateMemberRemoval() {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: `Souhaitez-vous supprimer ${this.member()!.firstName} ${this.member()!.lastName} ?`,
      },
    });

    dialogRef.closed
      .pipe(
        tap((result) => {
          if (!!result) {
            this.removeMember();
          }
        }),
      )
      .subscribe();
  }

  private removeMember() {
    this.familyStore.removeFamilyMember(this.family()!, this.member()!);
    this.router.navigate(['tutoring', 'family', this.family()!.id]);
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
