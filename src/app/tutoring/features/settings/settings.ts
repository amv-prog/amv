import { Dialog } from '@angular/cdk/dialog';
import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { filter, switchMap } from 'rxjs';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog';
import { GooglePicker } from '../../../shared/components/google-picker/google-picker';
import { Toggle } from '../../../shared/components/toggle/toggle';
import { GoogleDocInfo } from '../../../shared/models/google-doc-info';
import { AuthenticationService } from '../../../shared/services/authentication-service';
import { GoogleSheetService } from '../../../shared/services/google-sheet-service';
import { FileDataService } from '../../services/file-data-service';
import { SettingsStore } from '../../stores/settings-store';

@Component({
  selector: 'amv-settings',
  imports: [FormRoot, Toggle, FormField, GooglePicker],
  templateUrl: './settings.html',
})
export class Settings {
  private readonly settingsStore = inject(SettingsStore);
  private readonly googleSheetService = inject(GoogleSheetService);
  private readonly fileDataService = inject(FileDataService);
  private readonly authenticationService = inject(AuthenticationService);

  private readonly dialog = inject(Dialog);

  protected readonly isAuthenticationReady = this.authenticationService.isAuthenticationReady;
  protected readonly accessToken = this.authenticationService.accessToken;
  protected readonly settings = this.settingsStore.settings;

  protected readonly settingsFormData: WritableSignal<{
    saveMode: 'LEFT' | 'RIGHT';
  }> = signal({
    saveMode: this.settings().saveMode === 'LOCAL_STORAGE' ? 'LEFT' : 'RIGHT',
  });

  protected readonly settingsForm = form(this.settingsFormData);

  protected readonly sanitizedBlobUrl = this.fileDataService.sanitizedSettingsBlobUrl();
  protected readonly fileName = this.fileDataService.saveFileName();

  constructor() {
    effect(() => {
      if (this.settingsForm().dirty()) {
        const data = this.settingsForm().value();

        this.settingsStore.updateSaveMode(
          data.saveMode === 'LEFT' ? 'LOCAL_STORAGE' : 'GOOGLESHEET',
        );
      }
    });
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!!input.files?.length) {
      const file = input.files![0];
      this.fileDataService.loadFile(file);
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
        filter((result) => !!result),
        switchMap(() => this.fileDataService.cleanData$()),
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
        filter((result) => !!result),
        switchMap(() => this.fileDataService.importExemple$()),
      )
      .subscribe();
  }

  signOut() {
    this.authenticationService.handleGoogleSignOut();
  }

  selectFile(event: GoogleDocInfo) {
    this.settingsStore.updateSpreadsheet(event);
  }

  createGoogleSheet() {
    this.googleSheetService.createGoogleSheet('TestTU2309_02').subscribe();
  }

  renameSheet() {
    this.googleSheetService
      .renameSheet('1tjXanz-evFm7XeA3bH6XgjdP8VQx8shl3b1OoW1e8hQ', '0', 'TU_Data')
      .subscribe();
  }
}
