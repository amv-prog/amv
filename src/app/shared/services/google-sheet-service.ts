import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { BatchUpdateResponse } from '../models/google-sheet/batch-update-response';
import { Spreadsheet } from '../models/google-sheet/spreadsheet';
import { UpdateValuesResponse } from '../models/google-sheet/update-values-response';
import { ValueRange } from '../models/google-sheet/value-range';

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

  writeCell(
    spreadsheetId: string,
    sheetId: string,
    cell: string,
    value: string,
  ): Observable<UpdateValuesResponse> {
    const body: ValueRange = {
      values: [[value]],
    };
    return this.http.put<UpdateValuesResponse>(
      `${this.baseUrl}/${spreadsheetId}/values/${sheetId}!${cell}?valueInputOption=RAW`,
      body,
    );
  }

  renameSheet(
    spreadsheetId: string,
    sheetId: string,
    title: string,
  ): Observable<BatchUpdateResponse> {
    const body = {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId: sheetId,
              title: title,
            },
            fields: 'title',
          },
        },
      ],
    };
    return this.http.post<BatchUpdateResponse>(
      `${this.baseUrl}/${spreadsheetId}:batchUpdate`,
      body,
    );
  }
}
