import { computed, inject, Service, Signal, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { LocalStorageService } from '../../shared/services/local-storage-service';
import { SettingsStore } from '../stores/settings-store';
import { GoogleDataService } from './google-data-service';

@Service()
export class DataService {
  private readonly ERROR_DATA = 'error';
  private readonly settingStore = inject(SettingsStore);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly googleDataService = inject(GoogleDataService);

  private latestLoadedData = signal<Map<string, any>>(new Map<string, any>());

  reload$(): Observable<boolean> {
    return toObservable(this.settingStore.settings).pipe(
      switchMap(() => {
        return this.loadLatestData$();
      }),
    );
  }

  update$(type: SaveType, data: any): Observable<boolean> {
    const settings = this.settingStore.settings();
    if (settings.saveMode === 'GOOGLESHEET') {
      return this.googleDataService.saveData(type, data);
    } else {
      this.localStorageService.setItem(type, data);
      return of(true);
    }
  }

  getSignal<T>(type: SaveType, empty: T): Signal<T> {
    return computed(() => {
      return this.latestLoadedData().get(type) || empty;
    });
  }

  getLoadingErrors(): Signal<string[]> {
    return computed(() => {
      return this.latestLoadedData().get(this.ERROR_DATA) || [];
    });
  }

  removeData$(type: SaveType): Observable<boolean> {
    const settings = this.settingStore.settings();
    if (settings.saveMode === 'LOCAL_STORAGE') {
      localStorage.removeItem(type);
      return of(true);
    } else {
      return this.googleDataService.removeData(type);
    }
  }

  loadLatestData$(): Observable<boolean> {
    return this.loadLatestDataMap$().pipe(
      map((data) => {
        this.latestLoadedData.set(data);
        return true;
      }),
    );
  }

  saveNewData$(data: Map<string, any>): Observable<boolean> {
    const updates = Object.values(SaveType).map((type) => this.update$(type, data.get(type)));
    return combineLatest(updates).pipe(
      map(() => {
        this.latestLoadedData.set(data);
        return true;
      }),
    );
  }

  private loadLatestDataMap$(): Observable<Map<string, any>> {
    const settings = this.settingStore.settings();
    if (settings.saveMode === 'GOOGLESHEET') {
      const spreadsheetId = settings.spreadsheet?.id;
      if (spreadsheetId) {
        return this.googleDataService.getAllData(spreadsheetId).pipe(
          map((data) => {
            const map = new Map<string, any>();
            const errors: string[] = [];
            for (let [index, row] of data.entries()) {
              if (row.length === 2) {
                const stringValue = row[1];
                if (!!stringValue) {
                  try {
                    map.set(row[0], JSON.parse(stringValue));
                  } catch (error) {
                    errors.push(`Erreur de lecture ligne ${index + 1}`);
                  }
                }
              } else if (row.length > 2) {
                errors.push(`Ligne ${index + 1} mal formée`);
              }
            }
            if (errors.length > 0) {
              map.set(this.ERROR_DATA, errors);
            }
            return map;
          }),
          catchError((e) => {
            const data = new Map<string, any>();
            data.set(this.ERROR_DATA, ['Fichier non récupéré']);
            return of(data);
          }),
        );
      } else {
        const data = new Map<string, any>();
        data.set(this.ERROR_DATA, ['Aucun fichier renseigné']);
        return of(data);
      }
    } else {
      const map = new Map<string, string>();
      for (let type of Object.values(SaveType)) {
        map.set(type, this.localStorageService.getItem<any>(type) || '');
      }
      return of(map);
    }
  }
}

export enum SaveType {
  VERSION = 'version',
  FAMILIES = 'families',
  LESSONS = 'lessons',
  SCHOOLS = 'schools',
  VOLUNTEERS = 'volunteers',
}
