import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, linkedSignal, signal, WritableSignal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { catchError, tap } from 'rxjs';
import { DateService } from '../../../../shared/services/date-service';
import { MessageService } from '../../../../shared/services/message-service';
import { VolunteerService } from '../../../services/volunteer-service';

@Component({
  imports: [FormRoot, FormField],
  selector: 'amv-export-volunteers',
  templateUrl: './export-volunteers.html',
})
export class ExportVolunteers {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly dateService = inject(DateService);
  private readonly volunteerService = inject(VolunteerService);
  private readonly messageService = inject(MessageService);

  protected readonly newSheetFormData: WritableSignal<{
    name: string;
    title: string;
  }> = signal({
    name: `Bénévoles_${this.dateService.formatDate(new Date())}`,
    title: "Liste des bénévoles de l'association",
  });

  protected readonly newSheetForm = form(this.newSheetFormData, (form) => {
    required(form.name, { message: 'Veuillez saisir le nom de la feuille' });
  });

  protected readonly error = linkedSignal<string>(() => {
    // Ce signal doit être réinitialisé si le nom saisi change
    this.newSheetFormData();
    return '';
  });

  exportVolunteers() {
    if (this.newSheetForm().valid()) {
      this.volunteerService
        .addVolunteerSheet$(this.newSheetFormData().name, this.newSheetFormData().title)
        .pipe(
          tap(() => {
            this.messageService.displaySuccess('Bénévoles exportés avec succès');
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
