import { computed, inject, Service, Signal, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, Observable, of, switchMap } from 'rxjs';
import { AuthenticationService } from '../../shared/services/authentication-service';
import { LocalStorageService } from '../../shared/services/local-storage-service';
import { SettingsStore } from '../stores/settings-store';
import { GoogleDataService } from './google-data-service';

@Service()
export class DataService {
  private readonly settingStore = inject(SettingsStore);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly googleDataService = inject(GoogleDataService);
  private readonly authenticationService = inject(AuthenticationService);

  private latestLoadedData = signal<Map<string, any>>(new Map<string, any>());

  reload$(): Observable<boolean> {
    return combineLatest([
      toObservable(this.settingStore.settings),
      toObservable(this.authenticationService.accessToken),
    ]).pipe(
      filter(
        ([settings, accessToken]) =>
          settings.saveMode === 'LOCAL_STORAGE' || (!!settings.spreadsheetId && !!accessToken),
      ),
      switchMap(() => this.loadLatestData$()),
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
      const spreadsheetId = settings.spreadsheetId;
      if (spreadsheetId) {
        return this.googleDataService.getAllData(spreadsheetId).pipe(
          map((data) => {
            const map = new Map<string, any>();
            for (let row of data) {
              if (row.length === 2) {
                const stringValue = row[1];
                if (!!stringValue) {
                  try {
                    map.set(row[0], JSON.parse(stringValue));
                  } catch (error) {
                    console.error('Error reading from latest data', error);
                  }
                }
              }
            }
            return map;
          }),
        );
      } else {
        return of(new Map<string, any>());
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
