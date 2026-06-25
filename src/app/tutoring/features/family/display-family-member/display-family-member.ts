import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { DateService } from '../../../../shared/services/date-service';
import { Lesson } from '../../../models/lesson';
import { VolunteerMember } from '../../../models/volunteer-member';
import { FamilyStore } from '../../../stores/family-store';
import { LessonStore } from '../../../stores/lesson-store';
import { VolunteerStore } from '../../../stores/volunteer-store';

@Component({
  selector: 'amv-display-family-member',
  imports: [DatePipe],
  templateUrl: './display-family-member.html',
})
export class DisplayFamilyMember {
  private readonly familyStore = inject(FamilyStore);
  private readonly lessonStore = inject(LessonStore);
  private readonly volunteerStore = inject(VolunteerStore);
  private readonly dateService = inject(DateService);

  protected readonly daysMap = this.dateService.daysMap;

  protected readonly member = this.familyStore.selectedFamilyMember;
  protected readonly family = this.familyStore.selectedFamily;

  protected readonly lessonsToDisplay = computed(() => {
    const tutorsMap = this.volunteerStore.tutorsMap();

    return this.lessonStore
      .lessons()
      .filter((lesson) => lesson.studentId === this.member()?.id)
      .sort(this.compareLessons)
      .map((lesson) => {
        const tutor = tutorsMap.get(lesson.tutorId);

        return { lesson, tutor };
      });
  });

  private compareLessons(l1: Lesson, l2: Lesson): number {
    // Sunday is the first day but we want it to be last
    const d1 = l1.dayOfWeek || 7;
    const d2 = l2.dayOfWeek || 7;
    if (d1 === d2) {
      return l1.time.localeCompare(l2.time);
    } else if (d1 < d2) {
      return -1;
    } else {
      return 1;
    }
  }

  public displayTutorName(volunteer: VolunteerMember | undefined): string {
    return !!volunteer ? LessonStore.displayTutorName(volunteer) : 'Inconnu';
  }
}
