import { Dialog } from '@angular/cdk/dialog';
import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { debounce, form, FormField, FormRoot } from '@angular/forms/signals';
import { tap } from 'rxjs';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog';
import { GoogleButton } from '../../../shared/components/google-button/google-button';
import { Toggle } from '../../../shared/components/toggle/toggle';
import { GoogleSheetService } from '../../../shared/services/google-sheet-service';
import { LocalSaveService } from '../../services/local-save-service';
import { SettingsStore } from '../../stores/settings-store';
import * as exempleJson from './settings-exemple.json';

@Component({
  selector: 'amv-settings',
  imports: [FormRoot, Toggle, FormField, GoogleButton],
  templateUrl: './settings.html',
})
export class Settings {
  private readonly settingsStore = inject(SettingsStore);
  private readonly googleSheetService = inject(GoogleSheetService);
  private readonly localSaveService = inject(LocalSaveService);

  private readonly dialog = inject(Dialog);

  protected readonly settings = this.settingsStore.settings;

  protected readonly settingsFormData: WritableSignal<{
    saveMode: 'LEFT' | 'RIGHT';
    spreadsheetId: string;
  }> = signal({
    saveMode: this.settings().saveMode === 'LOCAL_STORAGE' ? 'LEFT' : 'RIGHT',
    spreadsheetId: this.settings().spreadsheetId || '',
  });

  protected readonly settingsForm = form(this.settingsFormData, (form) => {
    debounce(form.spreadsheetId, 500);
  });

  protected readonly sanitizedBlobUrl = this.localSaveService.sanitizedSettingsBlobUrl();
  protected readonly fileName = this.localSaveService.saveFileName();

  constructor() {
    effect(() => {
      if (this.settingsForm().dirty()) {
        const data = this.settingsForm().value();

        this.settingsStore.updateSettings({
          saveMode: data.saveMode === 'LEFT' ? 'LOCAL_STORAGE' : 'GOOGLESHEET',
          spreadsheetId: data.spreadsheetId || undefined,
        });
      }
    });
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!!input.files?.length) {
      const file = input.files![0];
      this.localSaveService.loadFile(file);
    }
    input.value = '';
  }

  validateCleanLocalData() {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: 'Souhaitez-vous vraiment supprimer vos données ?',
      },
    });

    dialogRef.closed
      .pipe(
        tap((result) => {
          if (!!result) {
            this.localSaveService.cleanData();
          }
        }),
      )
      .subscribe();
  }

  validateExempleLocalImport() {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: "Souhaitez-vous Importer les données d'exemple ? Les données actuelles seront supprimées.",
      },
    });

    dialogRef.closed
      .pipe(
        tap((result) => {
          if (!!result) {
            this.localSaveService.importSettings(exempleJson);
          }
        }),
      )
      .subscribe();
  }

  createGoogleSheet() {
    this.googleSheetService.createGoogleSheet('TestTU2309_02').subscribe();
  }

  writeCell() {
    this.googleSheetService
      .writeCell('1tjXanz-evFm7XeA3bH6XgjdP8VQx8shl3b1OoW1e8hQ', 'Feuille 1', 'A1', 'Test2')
      .subscribe();
  }

  renameSheet() {
    this.googleSheetService
      .renameSheet('1tjXanz-evFm7XeA3bH6XgjdP8VQx8shl3b1OoW1e8hQ', '0', 'TU_Data')
      .subscribe();
  }
}
