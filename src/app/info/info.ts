import { Component, inject } from '@angular/core';
import { NavigationService } from '../shared/services/navigation-service';

@Component({
  selector: 'amv-info',
  imports: [],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class Info {
  private readonly navigationService = inject(NavigationService);

  public back() {
    this.navigationService.back(['']);
  }
}
