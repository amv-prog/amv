import { Dialog } from '@angular/cdk/dialog';
import { Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { filter, switchMap } from 'rxjs';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { BreakpointService } from '../../../../shared/services/breakpoint-service';
import { TruncatePipe } from '../../../../shared/truncate-pipe';
import { SchoolClassDisplay } from '../../../models/display/school-class-display';
import { Family } from '../../../models/family';
import { RecipientMember } from '../../../models/recipient-member';
import { School } from '../../../models/school';
import { SchoolClass } from '../../../models/school-class';
import { FamilyStore } from '../../../stores/family-store';
import { LessonStore } from '../../../stores/lesson-store';
import { SchoolStore } from '../../../stores/school-store';
import { SettingsStore } from '../../../stores/settings-store';
import { EditClass } from '../edit-class/edit-class';
import { EditSchool } from '../edit-school/edit-school';
import { ExportSchools } from '../export-schools/export-schools';

@Component({
  selector: 'amv-school-list',
  imports: [TruncatePipe, FormRoot, FormField],
  templateUrl: './school-list.html',
})
export class SchoolList {
  private readonly dialog = inject(Dialog);

  protected readonly schoolStore = inject(SchoolStore);
  protected readonly familyStore = inject(FamilyStore);
  protected readonly settingsStore = inject(SettingsStore);

  private readonly breakpointService = inject(BreakpointService);
  protected readonly isMaxMedium = this.breakpointService.isMaxMedium;
  protected readonly isMaxSmall = this.breakpointService.isMaxSmall;
  protected readonly isXSmall = this.breakpointService.isXSmall;

  protected readonly schoolDisplays = computed(() => {
    const schools = this.schoolStore.sortedSchools();
    const families = this.familyStore.families();

    return SchoolStore.getSchoolDisplays(schools, families);
  });

  private readonly schoolYear = SchoolStore.currentSchoolYear();

  protected readonly years = computed(() => {
    const classYears = this.schoolStore
      .schools()
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
    // Si tous les enfants d'une année sont supprimés, on revient à l'année en cours
    effect(() => {
      const year = this.yearFormData().year;
      if (!!year && this.years().indexOf(Number(year)) < 0) {
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

  public filteredClasses(classDisplays: SchoolClassDisplay[]): Signal<SchoolClassDisplay[]> {
    return computed(() => {
      const year = this.yearFormData().year;
      const filteredClasses = !!year
        ? classDisplays.filter(
            (schoolClassDisplay) => schoolClassDisplay.schoolClass.year === Number(year),
          )
        : classDisplays;
      return filteredClasses;
    });
  }

  public memberCount(classDisplays: SchoolClassDisplay[]): number {
    return [...new Set(classDisplays.flatMap((c) => c.members).map((m) => m.member.id))].length;
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
        filter((result) => !!result),
        switchMap(() => this.schoolStore.removeClass$(school, schoolClass)),
      )
      .subscribe();
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
        filter((result) => !!result),
        switchMap(() => this.schoolStore.removeSchool$(school)),
      )
      .subscribe();
  }

  public displayStudentName(
    student: { member: RecipientMember; family: Family } | undefined,
  ): string {
    return !!student ? LessonStore.displayStudentName(student) : 'Inconnu';
  }

  export() {
    this.dialog.open<boolean>(ExportSchools, {
      panelClass: 'dialog',
    });
  }
}
