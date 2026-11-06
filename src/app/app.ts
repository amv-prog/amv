import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './layout/footer/footer';
import { Loader } from './shared/components/loader/loader';
import { BreakpointService } from './shared/services/breakpoint-service';
import { NavigationService } from './shared/services/navigation-service';

@Component({
  selector: 'amv-root',
  imports: [RouterOutlet, Footer, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly navigationService = inject(NavigationService);
  protected readonly isMaxSmall = inject(BreakpointService).isMaxSmall;
  protected readonly isMaxMedium = inject(BreakpointService).isMaxMedium;
  constructor() {
    this.navigationService.historyManagement$().subscribe();
  }
}
