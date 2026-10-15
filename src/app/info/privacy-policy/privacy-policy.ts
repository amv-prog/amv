import { Component, inject } from '@angular/core';
import { NavigationService } from '../../shared/services/navigation-service';

@Component({
  selector: 'amv-privacy-policy',
  imports: [],
  templateUrl: './privacy-policy.html',
})
export class PrivacyPolicy {
  private readonly navigationService = inject(NavigationService);

  public back() {
    this.navigationService.back(['']);
  }
}
