import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Spreadsheet } from '../models/google-sheet/spreadsheet';

@Service()
export class GoogleSheetService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  createGoogleSheet(title: string): Observable<Spreadsheet> {
    return this.http.post<Spreadsheet>(this.baseUrl, {
      properties: {
        title: title,
      },
    });
  }
}
