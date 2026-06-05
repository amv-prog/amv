import { Location } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private history: string[] = [];

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  back(defaultCommands: readonly any[] = ['/'], defaultExtras?: NavigationExtras): void {
    this.history.pop();
    if (this.history.length > 0) {
      this.location.back();
    } else {
      this.router.navigate(defaultCommands, defaultExtras);
    }
  }
}
