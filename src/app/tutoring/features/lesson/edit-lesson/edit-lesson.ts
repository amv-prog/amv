import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { FieldTree, form, FormField, FormRoot, required } from '@angular/forms/signals';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { SignalToggle } from '../../../../shared/components/signal-toggle/signal-toggle';
import { DateService } from '../../../../shared/services/date-service';
import { NavigationService } from '../../../../shared/services/navigation-service';
import { Family } from '../../../models/family';
import { Lesson } from '../../../models/lesson';
import { RecipientMember } from '../../../models/recipient-member';
import { VolunteerMember } from '../../../models/volunteer-member';
import { FamilyStore } from '../../../stores/family-store';
import { LessonStore } from '../../../stores/lesson-store';
import { VolunteerStore } from '../../../stores/volunteer-store';

@Component({
  selector: 'amv-edit-lesson',
  imports: [
    FormField,
    FormRoot,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    SignalToggle,
  ],
  templateUrl: './edit-lesson.html',
})
export class EditLesson {
  private readonly familyStore = inject(FamilyStore);
  private readonly volunteerStore = inject(VolunteerStore);
  private readonly lessonStore = inject(LessonStore);
  private readonly dateService = inject(DateService);

  protected readonly daysMap = this.dateService.daysMap;

  protected readonly studentsMap = this.familyStore.childrenMap;
  protected readonly tutorsMap = this.volunteerStore.tutorsMap;

  private readonly navigationService = inject(NavigationService);

  protected readonly sortedStudents = computed(() =>
    [...this.studentsMap().entries()]
      .map((entry) => {
        return { ...entry[1], displayName: this.displayStudentName(entry[1]) };
      })
      .sort((s1, s2) => s1.displayName.localeCompare(s2.displayName)),
  );

  protected readonly sortedTutors = computed(() =>
    [...this.tutorsMap().entries()]
      .map((entry) => {
        return { ...entry[1], displayName: this.displayTutorName(entry[1]) };
      })
      .sort((s1, s2) => s1.displayName.localeCompare(s2.displayName)),
  );

  private readonly lessonFormData: WritableSignal<{
    student: string;
    tutor: string;
    dayOfWeek: string;
    time: string;
    place: 'LEFT' | 'RIGHT';
    startDate: Date;
    endDate: Date | null;
  }>;

  protected readonly lessonForm: FieldTree<
    {
      student: string;
      tutor: string;
      dayOfWeek: string;
      time: string;
      place: 'LEFT' | 'RIGHT';
      startDate: Date;
      endDate: Date | null;
    },
    string | number,
    'writable'
  >;

  constructor() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.lessonFormData = signal({
      student: '',
      tutor: '',
      dayOfWeek: '',
      time: '',
      place: 'LEFT',
      startDate: today,
      endDate: null,
    });

    this.lessonForm = form(
      this.lessonFormData,
      (form) => {
        (required(form.student, { message: "Veuillez sélectionner l'élève" }),
          required(form.tutor, { message: "Veuillez sélectionner l'encadrant" }),
          required(form.dayOfWeek, { message: 'Veuillez sélectionner le jour de la semaine' }),
          required(form.time, { message: "Veuillez sélectionner l'heure" }),
          required(form.startDate, { message: 'Veuillez sélectionner la date de début' }));
      },
      {
        submission: {
          action: async () => this.register(),
          ignoreValidators: 'none',
        },
      },
    );
  }

  public displayStudentName(student: { member: RecipientMember; family: Family }): string {
    return LessonStore.displayStudentName(student);
  }

  public displayTutorName(volunteer: VolunteerMember): string {
    return LessonStore.displayTutorName(volunteer);
  }

  public cancel() {
    this.navigationService.back(['tutoring', 'lesson', 'list']);
  }

  private register(): void {
    if (this.lessonForm().valid()) {
      const formData = this.lessonFormData();
      let startDate = this.dateService.formatDate(this.lessonFormData().startDate);
      const formEndDate = this.lessonFormData().endDate;
      let endDate = formEndDate ? this.dateService.formatDate(formEndDate) : undefined;
      const place = this.lessonFormData().place === 'LEFT' ? 'ASSOCIATION' : 'HOME';

      this.lessonStore.addLesson(
        new Lesson(
          formData.student,
          formData.tutor,
          Number(formData.dayOfWeek),
          formData.time,
          place,
          startDate!,
          endDate,
        ),
      );
      this.navigationService.back(['tutoring', 'lesson', 'list']);
    }
  }
}
