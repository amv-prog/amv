import { afterRenderEffect, Component, inject, untracked } from '@angular/core';
import { AuthenticationService } from '../../services/authentication-service';

@Component({
  selector: 'amv-google-button',
  imports: [],
  templateUrl: './google-button.html',
})
export class GoogleButton {
  private readonly authenticationService = inject(AuthenticationService);

  protected readonly isGsiLoaded = this.authenticationService.isGsiLoaded;

  protected readonly user = this.authenticationService.googleUser;

  constructor() {
    afterRenderEffect(() => {
      if (this.authenticationService.isGsiLoaded()) {
        const buttonContainer = document.getElementById('g_id_signin_container');
        if (buttonContainer) {
          google.accounts.id.renderButton(buttonContainer, {
            type: 'standard',
            size: 'large',
            theme: 'outline',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 300,
          });
        }
      }
    });

    afterRenderEffect(() => {
      const user = !!this.authenticationService.googleUser();

      untracked(() => {
        const buttonContainer = document.getElementById('g_id_signin_container');
        if (buttonContainer) {
          if (!!user) {
            buttonContainer.style.visibility = 'hidden';
          } else {
            buttonContainer.style.visibility = 'visible';
          }
        }
      });
    });
  }

  signOut() {
    this.authenticationService.handleGoogleSignOut();
  }
}
