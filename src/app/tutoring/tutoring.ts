import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { Menu } from './layout/menu/menu';
import { SaveService } from './services/save-service';

@Component({
  selector: 'amv-tutoring',
  imports: [RouterOutlet, Menu],
  templateUrl: './tutoring.html',
})
export class Tutoring {
  private readonly saveService = inject(SaveService);
  constructor() {
    this.saveService.reload$().pipe(takeUntilDestroyed()).subscribe();
  }
}
