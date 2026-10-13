import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, output, signal } from '@angular/core';
import '@googleworkspace/drive-picker-element';
import { OAuthResponseEvent, PickerPickedEvent } from '@googleworkspace/drive-picker-element';
import { GoogleDocInfo } from '../../models/google-doc-info';
import { AuthenticationService } from '../../services/authentication-service';

@Component({
  selector: 'amv-google-picker',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './google-picker.html',
})
export class GooglePicker {
  protected readonly clientId = AuthenticationService.CLIENT_ID;
  protected readonly appId = AuthenticationService.APP_ID;

  private readonly authenticationService = inject(AuthenticationService);

  protected readonly showPicker = signal(false);
  protected readonly accessToken = this.authenticationService.accessToken;

  readonly fileSelected = output<GoogleDocInfo>();

  openPicker() {
    this.showPicker.set(true);
  }

  onFilePicked(event: PickerPickedEvent) {
    this.showPicker.set(false);
    const docs = event.detail.docs;
    if (docs && docs.length > 0) {
      const fileId = docs[0].id;
      const fileName = docs[0].name;
      this.fileSelected.emit({ id: fileId, name: fileName });
    }
  }

  onCanceled() {
    this.showPicker.set(false);
  }

  onPickerError(event: any) {
    this.showPicker.set(false);
    console.error('Picker error:', event.detail);
  }

  onPickerOauthResponse(event: OAuthResponseEvent) {
    this.authenticationService.accessToken.set(event.detail.access_token);
  }

  onPickerOauthError() {
    this.authenticationService.handleGoogleSignOut();
  }
}
