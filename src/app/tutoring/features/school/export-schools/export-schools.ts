import { DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, linkedSignal, signal, WritableSignal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { catchError, tap } from 'rxjs';
import { DateService } from '../../../../shared/services/date-service';
import { MessageService } from '../../../../shared/services/message-service';
import { SchoolExportService } from '../../../services/school-export-service';
import { SchoolStore } from '../../../stores/school-store';

@Component({
  imports: [FormRoot, FormField],
  selector: 'amv-export-schools',
  templateUrl: './export-schools.html',
})
export class ExportSchools {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly dateService = inject(DateService);
  private readonly schoolExportService = inject(SchoolExportService);
  private readonly messageService = inject(MessageService);
  protected readonly schoolStore = inject(SchoolStore);

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

  protected readonly newSheetFormData: WritableSignal<{
    name: string;
    title: string;
    year: string;
  }> = signal({
    name: `Écoles_${this.dateService.formatDate(new Date())}`,
    title: 'Liste des écoles',
    year: this.schoolYear.toString(),
  });

  protected readonly newSheetForm = form(this.newSheetFormData, (form) => {
    required(form.name, { message: 'Veuillez saisir le nom de la feuille' });
  });

  protected readonly error = linkedSignal<string>(() => {
    // Ce signal doit être réinitialisé si le formulaire change
    this.newSheetFormData();
    return '';
  });

  exportSchools() {
    if (this.newSheetForm().valid()) {
      this.schoolExportService
        .addSchoolSheet$(
          this.newSheetFormData().name,
          Number(this.newSheetFormData().year),
          this.newSheetFormData().title,
        )
        .pipe(
          tap(() => {
            this.messageService.displaySuccess('Écoles exportées avec succès');
            this.dialogRef.close();
          }),
          catchError((e) => {
            if (e.status === 400) {
              this.error.set(
                "La création a échoué, vérifiez qu'aucune autre feuille n'a le même nom.",
              );
            } else {
              this.error.set('La création a échoué.');
            }
            throw e;
          }),
        )
        .subscribe();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
