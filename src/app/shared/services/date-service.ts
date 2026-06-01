import { formatDate } from '@angular/common';
import { inject, Injectable, LOCALE_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  protected readonly locale = inject(LOCALE_ID);

  public stringToDate(dateString: string | undefined): Date | undefined {
    return dateString ? new Date(dateString) : undefined;
  }

  public formatDate(date: Date | undefined, format = 'yyyy-MM-dd'): string | undefined {
    return date ? formatDate(date, format, this.locale) : undefined;
  }
}
