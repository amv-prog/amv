import { Dialog } from '@angular/cdk/dialog';
import { Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { tap } from 'rxjs';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { TruncatePipe } from '../../../../shared/truncate-pipe';
import { School } from '../../../models/school';
import { SchoolClass } from '../../../models/school-class';
import { SchoolStore } from '../../../stores/school-store';
import { EditClass } from '../edit-class/edit-class';
import { EditSchool } from '../edit-school/edit-school';

@Component({
  selector: 'amv-school-list',
  imports: [TruncatePipe, FormRoot, FormField],
  templateUrl: './school-list.html',
})
export class SchoolList {
  private readonly dialog = inject(Dialog);

  protected readonly schoolStore = inject(SchoolStore);

  protected readonly schools = this.schoolStore.sortedSchools;

  private readonly schoolYear = SchoolStore.currentSchoolYear();

  protected readonly years = computed(() => {
    const classYears = this.schools()
      .flatMap((school) => school.classes)
      .map((schoolClass) => schoolClass.year);

    const minYear = Math.min(this.schoolYear, ...classYears);
    const maxYear = Math.max(this.schoolYear, ...classYears);

    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => i + minYear);
  });

  private readonly yearFormData = signal({
    year: this.schoolYear.toString(),
  });

  protected readonly yearForm = form(this.yearFormData);

  constructor() {
    effect(() => {
      const year = this.yearFormData().year;
      if (!!year && this.years().indexOf(Number(this.yearFormData().year)) < 0) {
        this.yearFormData.set({
          year: this.schoolYear.toString(),
        });
      }
    });
  }

  public openEditSchoolDialog(school?: School) {
    this.dialog.open(EditSchool, {
      panelClass: 'dialog',
      data: {
        school,
      },
    });
  }

  public openAddClassDialog(school: School) {
    this.dialog.open(EditClass, {
      panelClass: 'dialog',
      data: {
        school,
      },
    });
  }

  public openEditClassDialog(school: School, schoolClass: SchoolClass) {
    this.dialog.open(EditClass, {
      panelClass: 'dialog',
      data: {
        school,
        class: schoolClass,
      },
    });
  }

  public filteredClasses(classes: SchoolClass[]): Signal<SchoolClass[]> {
    return computed(() => {
      const year = this.yearFormData().year;
      const filteredClasses = !!year
        ? classes.filter((schoolClass) => schoolClass.year === Number(year))
        : classes;
      return SchoolStore.sortedClasses(filteredClasses);
    });
  }

  public validateClassRemoval(school: School, schoolClass: SchoolClass) {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: `Souhaitez-vous supprimer la classe de ${schoolClass.teachers.join(' et ')} pour l'année ${schoolClass.year} - ${schoolClass.year + 1} ?`,
      },
    });

    dialogRef.closed
      .pipe(
        tap((result) => {
          if (!!result) {
            this.removeClass(school, schoolClass);
          }
        }),
      )
      .subscribe();
  }

  private removeClass(school: School, schoolClass: SchoolClass) {
    this.schoolStore.removeClass(school, schoolClass);
  }

  public validateSchoolRemoval(school: School) {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: `Souhaitez-vous supprimer ${school.name}, ainsi que toutes ses classes ?`,
      },
    });

    dialogRef.closed
      .pipe(
        tap((result) => {
          if (!!result) {
            this.removeSchool(school);
          }
        }),
      )
      .subscribe();
  }

  private removeSchool(school: School) {
    this.schoolStore.removeSchool(school);
  }
}
