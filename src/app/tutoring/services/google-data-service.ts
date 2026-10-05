import { inject, Service } from '@angular/core';
import { map, Observable, of, throwError } from 'rxjs';
import { GoogleSheetService } from '../../shared/services/google-sheet-service';
import { SettingsStore } from '../stores/settings-store';
import { SaveType } from './data-service';

@Service()
export class GoogleDataService {
  private readonly googleSheetService = inject(GoogleSheetService);
  private readonly settingStore = inject(SettingsStore);
  private readonly SAVE_SHEET = 'TU_Data';

  saveData(type: SaveType, data: any): Observable<boolean> {
    const spreadsheetId = this.settingStore.settings().spreadsheetId;
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

  getAllData(spreadsheetId: string): Observable<string[][]> {
    return this.googleSheetService
      .readAllCells(spreadsheetId, this.SAVE_SHEET)
      .pipe(map((valueRange) => valueRange.values || [[]]));
  }

  removeData(type: SaveType): Observable<boolean> {
    const spreadsheetId = this.settingStore.settings().spreadsheetId;
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

  private getIndex(type: SaveType): number {
    switch (type) {
      case SaveType.VERSION:
        return 1;
      case SaveType.FAMILIES:
        return 2;
      case SaveType.LESSONS:
        return 3;
      case SaveType.SCHOOLS:
        return 4;
      case SaveType.VOLUNTEERS:
        return 5;
      default:
        return 0;
    }
  }
}
