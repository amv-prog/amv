import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointService } from '../../../shared/services/breakpoint-service';
import { SynchronizationInfo } from './synchronization-info/synchronization-info';

@Component({
  selector: 'amv-menu',
  imports: [RouterLink, RouterLinkActive, SynchronizationInfo],
  templateUrl: './menu.html',
})
export class Menu {
  protected readonly isXSmall = inject(BreakpointService).isXSmall;
}
