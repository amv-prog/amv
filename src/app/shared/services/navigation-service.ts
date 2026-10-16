import { Location } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Event, NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private history: string[] = [];

  constructor() {
    this.history.push(this.router.url);
  }

  historyManagement$(): Observable<Event> {
    return this.router.events.pipe(
      tap((event) => {
        if (event instanceof NavigationEnd) {
          this.history.push(event.urlAfterRedirects);
        }
      }),
    );
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
