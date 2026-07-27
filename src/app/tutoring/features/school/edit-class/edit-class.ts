import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { School } from '../../../models/school';
import { SchoolClass } from '../../../models/school-class';
import { SchoolStore } from '../../../stores/school-store';

@Component({
  selector: 'amv-edit-class',
  imports: [FormRoot, FormField],
  templateUrl: './edit-class.html',
})
export class EditClass {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly schoolStore = inject(SchoolStore);

  data = inject(DIALOG_DATA);

  protected readonly school = this.data.school as School;
  protected readonly class = this.data?.class as SchoolClass | undefined;

  private readonly schoolYear = SchoolStore.currentSchoolYear();

  private readonly classFormData = signal({
    year: this.class?.year.toString() || this.schoolYear.toString(),
    teachers: !!this.class && this.class!.teachers.length > 0 ? this.class!.teachers : [''],
    grades: !!this.class && this.class!.grades.length > 0 ? this.class!.grades : [''],
    additionalInfo: this.class?.additionalInfo || '',
  });

  protected readonly classForm = form(
    this.classFormData,
    (form) => {
      required(form.year, { message: "L'année scolaire est obligatoire" });
      required(form.teachers, { message: "L'enseignant est obligatoire" });
      required(form.grades, { message: 'Le niveau est obligatoire' });
    },
    {
      submission: {
        action: async () => this.register(),
        ignoreValidators: 'none',
      },
    },
  );

  protected readonly years: number[];

  constructor() {
    const minYear = this.class?.year
      ? Math.min(this.schoolYear - 1, this.class.year - 1)
      : this.schoolYear - 1;
    const maxYear = this.class?.year
      ? Math.max(this.schoolYear + 1, this.class.year + 1)
      : this.schoolYear + 1;

    this.years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => i + minYear);
  }

  addTeacher() {
    this.classFormData.update((data) => ({
      ...data,
      teachers: [...data.teachers, ''],
    }));
  }

  removeTeacher(index: number) {
    this.classFormData.update((data) => ({
      ...data,
      teachers: [...data.teachers.slice(0, index), ...data.teachers.slice(index + 1)],
    }));
  }

  addGrade() {
    this.classFormData.update((data) => ({
      ...data,
      grades: [...data.grades, ''],
    }));
  }

  removeGrade(index: number) {
    this.classFormData.update((data) => ({
      ...data,
      grades: [...data.grades.slice(0, index), ...data.grades.slice(index + 1)],
    }));
  }

  register(): void {
    if (this.classForm().valid()) {
      let current = this.class;
      const formData = this.classFormData();
      const grades = SchoolStore.sortedGrades(formData.grades.filter((v) => !!v));
      if (!!current) {
        current = {
          ...current,
          year: Number(formData.year),
          teachers: formData.teachers.filter((v) => !!v),
          grades: grades,
          additionalInfo: formData.additionalInfo.trim(),
        };
      } else {
        current = new SchoolClass(
          Number(formData.year),
          formData.teachers.filter((v) => !!v),
          grades,
          formData.additionalInfo.trim(),
        );
      }
      this.schoolStore.updateClass(this.school, current);
      this.dialogRef.close(true);
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
