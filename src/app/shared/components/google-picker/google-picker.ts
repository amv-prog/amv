import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import '@googleworkspace/drive-picker-element';
import { SettingsStore } from '../../../tutoring/stores/settings-store';
import { AuthenticationService } from '../../services/authentication-service';

@Component({
  selector: 'amv-google-picker',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './google-picker.html',
})
export class GooglePicker {
  protected readonly apiKey = AuthenticationService.API_KEY;
  protected readonly clientId = AuthenticationService.CLIENT_ID;
  protected readonly appId = AuthenticationService.APP_ID;

  private readonly authenticationService = inject(AuthenticationService);
  private readonly settingsStore = inject(SettingsStore);

  protected readonly showPicker = signal(false);
  protected readonly accessToken = this.authenticationService.accessToken;

  openPicker() {
    this.showPicker.set(true);
  }

  onFilePicked(event: any) {
    this.showPicker.set(false);
    console.log('Full event received:', event);
    // The 'picked' event returns the standard Google Picker response object
    const docs = event.detail.docs;
    if (docs && docs.length > 0) {
      const fileId = docs[0].id;
      const fileName = docs[0].name;
      console.log(`User selected: ${fileName} (ID: ${fileId})`);
      this.settingsStore.updateSpreadsheetId(fileId);
      // Now you can use this fileId with the Google Sheets API
    }
  }

  onCanceled() {
    this.showPicker.set(false);
  }

  onPickerError(event: any) {
    this.showPicker.set(false);
    console.error('Picker error:', event.detail);
  }
}
