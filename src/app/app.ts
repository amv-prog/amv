import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './layout/footer/footer';
import { Loader } from './shared/components/loader/loader';
import { NavigationService } from './shared/services/navigation-service';

@Component({
  selector: 'amv-root',
  imports: [RouterOutlet, Footer, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly navigationService = inject(NavigationService);
  constructor() {
    this.navigationService.historyManagement$().subscribe();
  }
}
