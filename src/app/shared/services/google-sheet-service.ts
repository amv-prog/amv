import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { BatchUpdateResponse } from '../models/google-sheet/batch-update-response';
import { ClearValuesResponse } from '../models/google-sheet/clear-values-response';
import { SheetProperties } from '../models/google-sheet/sheet-properties';
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

  getGoogleSheet(spreadsheetId: string): Observable<Spreadsheet> {
    return this.http.get<Spreadsheet>(`${this.baseUrl}/${spreadsheetId}`);
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

  writeCells(
    spreadsheetId: string,
    sheetId: string,
    range: string,
    values: string[][],
  ): Observable<UpdateValuesResponse> {
    const body: ValueRange = {
      values,
    };
    return this.http.put<UpdateValuesResponse>(
      `${this.baseUrl}/${spreadsheetId}/values/${sheetId}!${range}?valueInputOption=RAW`,
      body,
    );
  }

  addSheet$(spreadsheetId: string, title: string): Observable<BatchUpdateResponse> {
    const addSheetProperties: SheetProperties = { title, index: 0 };
    const body = {
      requests: [
        {
          addSheet: {
            properties: addSheetProperties,
          },
        },
      ],
    };
    return this.http.post<BatchUpdateResponse>(
      `${this.baseUrl}/${spreadsheetId}:batchUpdate`,
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

  readCells(spreadsheetId: string, sheetId: string, range: string): Observable<ValueRange> {
    return this.http.get<ValueRange>(
      `${this.baseUrl}/${spreadsheetId}/values/${sheetId}!${range}?majorDimension=ROWS`,
    );
  }

  readAllCells(spreadsheetId: string, sheetId: string): Observable<ValueRange> {
    return this.http.get<ValueRange>(
      `${this.baseUrl}/${spreadsheetId}/values/${sheetId}?majorDimension=ROWS`,
    );
  }

  clearCells(
    spreadsheetId: string,
    sheetId: string,
    range: string,
  ): Observable<ClearValuesResponse> {
    return this.http.post<ClearValuesResponse>(
      `${this.baseUrl}/${spreadsheetId}/values/${sheetId}!${range}:clear`,
      undefined,
    );
  }
}
