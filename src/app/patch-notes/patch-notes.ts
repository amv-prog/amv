import { Component, inject } from '@angular/core';
import { NavigationService } from '../shared/navigation-service';

@Component({
  selector: 'amv-patch-notes',
  imports: [],
  templateUrl: './patch-notes.html',
})
export class PatchNotes {
  private readonly navigationService = inject(NavigationService);

  public back() {
    this.navigationService.back(['']);
  }
}
