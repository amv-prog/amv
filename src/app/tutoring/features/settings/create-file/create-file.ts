import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { catchError, tap } from 'rxjs';
import { LoadingService } from '../../../../shared/services/loading-service';
import { MessageService } from '../../../../shared/services/message-service';
import { DataService } from '../../../services/data-service';
import { GoogleDataService } from '../../../services/google-data-service';
import { SettingsStore } from '../../../stores/settings-store';

@Component({
  selector: 'amv-create-file',
  imports: [FormRoot, FormField],
  templateUrl: './create-file.html',
})
export class CreateFile {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly settingsStore = inject(SettingsStore);
  private readonly googleDataService = inject(GoogleDataService);
  private readonly dataService = inject(DataService);
  private readonly messageService = inject(MessageService);
  private readonly loadingService = inject(LoadingService);

  protected readonly error = signal<string>('');

  protected readonly newFileFormData: WritableSignal<{
    name: string;
  }> = signal({
    name: 'Tutoring',
  });

  protected readonly newFileForm = form(this.newFileFormData, (form) => {
    required(form.name, { message: 'Veuillez saisir le nom du fichier' });
  });

  createEmptyFile() {
    if (this.newFileForm().valid()) {
      const name = this.newFileFormData().name;
      this.googleDataService
        .createEmptyFile$(name)
        .pipe(
          tap((spreadsheet) => {
            this.settingsStore.updateSettings({
              saveMode: 'GOOGLESHEET',
              spreadsheet: {
                id: spreadsheet.spreadsheetId,
                name: spreadsheet.properties.title,
              },
            });
            this.messageService.displaySuccess('Fichier créé avec succès');
            this.dialogRef.close();
          }),
          catchError((e) => {
            this.error.set('La création a échoué.');
            throw e;
          }),
        )
        .subscribe();
    }
  }

  createCurrentDataFile() {
    if (this.newFileForm().valid()) {
      const name = this.newFileFormData().name;
      this.dataService
        .createCurrentDataGoogle$(name)
        .pipe(
          tap((spreadsheet) => {
            this.settingsStore.updateSettings({
              saveMode: 'GOOGLESHEET',
              spreadsheet: {
                id: spreadsheet.spreadsheetId,
                name: spreadsheet.properties.title,
              },
            });
            this.messageService.displaySuccess('Fichier créé avec succès');
            this.dialogRef.close();
          }),
          catchError((e) => {
            this.error.set('La création a échoué.');
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
