import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { BreakpointService } from '../shared/services/breakpoint-service';
import { Menu } from './layout/menu/menu';
import { DataService } from './services/data-service';

@Component({
  selector: 'amv-tutoring',
  imports: [RouterOutlet, Menu],
  templateUrl: './tutoring.html',
})
export class Tutoring {
  private readonly dataService = inject(DataService);

  protected readonly isSmall = inject(BreakpointService).isSmall;

  constructor() {
    this.dataService.reload$().pipe(takeUntilDestroyed()).subscribe();
  }
}
