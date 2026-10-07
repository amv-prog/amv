import { inject, Service } from '@angular/core';
import { map, Observable, of, switchMap, throwError } from 'rxjs';
import { Spreadsheet } from '../../shared/models/google-sheet/spreadsheet';
import { GoogleSheetService } from '../../shared/services/google-sheet-service';
import { SettingsStore } from '../stores/settings-store';
import { SaveType } from './data-service';

@Service()
export class GoogleDataService {
  private readonly googleSheetService = inject(GoogleSheetService);
  private readonly settingStore = inject(SettingsStore);
  private readonly SAVE_SHEET = 'App_Data';

  saveData$(
    type: SaveType,
    data: any,
    spreadsheetId = this.settingStore.settings().spreadsheet?.id,
  ): Observable<boolean> {
    if (!!spreadsheetId) {
      const index = this.getIndex(type);
      return this.googleSheetService
        .writeCells(spreadsheetId, this.SAVE_SHEET, `A${index}:B${index}`, [
          [type, JSON.stringify(data)],
        ])
        .pipe(map(() => true));
    } else {
      return throwError(() => {
        const error: any = new Error('Sauvegarde impossible, pas de fichier saisi');
        error.timestamp = Date.now();
        return error;
      });
    }
  }

  getAllData$(spreadsheetId: string): Observable<string[][]> {
    return this.googleSheetService
      .readAllCells(spreadsheetId, this.SAVE_SHEET)
      .pipe(map((valueRange) => valueRange.values || [[]]));
  }

  removeData$(type: SaveType): Observable<boolean> {
    const spreadsheetId = this.settingStore.settings().spreadsheet?.id;
    if (!!spreadsheetId) {
      const index = this.getIndex(type);
      if (!!index) {
        return this.googleSheetService
          .clearCells(spreadsheetId, this.SAVE_SHEET, `A${index}:B${index}`)
          .pipe(map(() => true));
      } else {
        return of(true);
      }
    } else {
      return throwError(() => {
        const error: any = new Error('Sauvegarde impossible, pas de fichier saisi');
        error.timestamp = Date.now();
        return error;
      });
    }
  }

  createEmptyFile$(name: string): Observable<Spreadsheet> {
    return this.googleSheetService.createGoogleSheet(name).pipe(
      switchMap((spreadsheet) => {
        return this.googleSheetService
          .renameSheet(spreadsheet.spreadsheetId, '0', this.SAVE_SHEET)
          .pipe(
            map(() => {
              return spreadsheet;
            }),
          );
      }),
    );
  }

  private getIndex(type: SaveType): number {
    switch (type) {
      case SaveType.VERSION:
        return 2;
      case SaveType.FAMILIES:
        return 3;
      case SaveType.LESSONS:
        return 4;
      case SaveType.SCHOOLS:
        return 5;
      case SaveType.VOLUNTEERS:
        return 6;
      default:
        return 0;
    }
  }
}
