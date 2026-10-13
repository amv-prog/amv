import { Dialog } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { filter, switchMap } from 'rxjs';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog';
import { GooglePicker } from '../../../shared/components/google-picker/google-picker';
import { GoogleDocInfo } from '../../../shared/models/google-doc-info';
import { AuthenticationService } from '../../../shared/services/authentication-service';
import { FileDataService } from '../../services/file-data-service';
import { SettingsStore } from '../../stores/settings-store';
import { CreateFile } from './create-file/create-file';

@Component({
  selector: 'amv-settings',
  imports: [GooglePicker],
  templateUrl: './settings.html',
})
export class Settings {
  private readonly settingsStore = inject(SettingsStore);
  private readonly fileDataService = inject(FileDataService);
  private readonly authenticationService = inject(AuthenticationService);

  private readonly dialog = inject(Dialog);

  protected readonly isAuthenticationReady = this.authenticationService.isAuthenticationReady;
  protected readonly accessToken = this.authenticationService.accessToken;
  protected readonly settings = this.settingsStore.settings;

  protected readonly sanitizedBlobUrl = this.fileDataService.sanitizedSettingsBlobUrl();
  protected readonly fileName = this.fileDataService.saveFileName();

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!!input.files?.length) {
      const file = input.files![0];
      this.fileDataService.loadFile(file);
    }
    input.value = '';
  }

  switchToLocal() {
    this.authenticationService.handleGoogleSignOut();
    this.settingsStore.updateSpreadsheet(undefined);
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

  selectFile(event: GoogleDocInfo) {
    this.settingsStore.updateSpreadsheet(event);
  }

  createGoogleSheet() {
    this.dialog.open<boolean>(CreateFile, {
      panelClass: 'dialog',
    });
  }
}
