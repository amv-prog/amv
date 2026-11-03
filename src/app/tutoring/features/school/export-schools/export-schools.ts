import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, linkedSignal, signal, WritableSignal } from '@angular/core';
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

  private readonly schoolYear = SchoolStore.currentSchoolYear(8);

  protected readonly newSheetFormData: WritableSignal<{
    name: string;
    title: string;
  }> = signal({
    name: `Écoles_${this.dateService.formatDate(new Date())}`,
    title: `Soutien scolaire ${this.schoolYear}-${this.schoolYear + 1}`,
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
        .addSchoolSheet$(this.newSheetFormData().name, this.newSheetFormData().title)
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
