import { formatDate } from '@angular/common';
import { inject, Injectable, LOCALE_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  protected readonly locale = inject(LOCALE_ID);

  public static stringToDate(dateString: string | undefined): Date | undefined {
    return dateString ? new Date(dateString) : undefined;
  }

  public formatDate(date: Date | undefined, format = 'yyyy-MM-dd'): string | undefined {
    return date ? formatDate(date, format, this.locale) : undefined;
  }

  public static compareDays(d1: string | Date | undefined, d2: string | Date | undefined): number {
    if (d1 === d2) {
      return 0;
    } else if (d1 === undefined) {
      return -1;
    } else if (d2 === undefined) {
      return 1;
    } else {
      const date1 = new Date(d1);
      date1.setHours(0, 0, 0, 0);
      const date2 = new Date(d2);
      date2.setHours(0, 0, 0, 0);
      const time1 = date1.getTime();
      const time2 = date2.getTime();
      if (time1 === time2) {
        return 0;
      } else if (time1 < time2) {
        return -1;
      } else {
        return 1;
      }
    }
  }
}
