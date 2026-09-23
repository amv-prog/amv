import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthenticationService } from '../../../shared/services/authentication-service';

@Component({
  selector: 'amv-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
})
export class Menu {
  private readonly authenticationService = inject(AuthenticationService);

  protected readonly googleUser = this.authenticationService.googleUser;
}
