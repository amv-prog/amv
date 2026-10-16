import { Component, inject } from '@angular/core';
import { NavigationService } from '../../shared/services/navigation-service';

@Component({
  selector: 'amv-cgu',
  imports: [],
  templateUrl: './cgu.html',
})
export class CGU {
  private readonly navigationService = inject(NavigationService);

  public back() {
    this.navigationService.back(['']);
  }
}
