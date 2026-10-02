import { computed, effect, inject, Service, Signal, signal, untracked } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { LocalStorageService } from '../../shared/services/local-storage-service';
import { MessageService } from '../../shared/services/message-service';
import { SettingsStore } from '../stores/settings-store';
import { GoogleSaveService } from './google-save-service';
import { LocalSaveService } from './local-save-service';

@Service()
export class SaveService {
  private readonly settingStore = inject(SettingsStore);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly googleSaveService = inject(GoogleSaveService);
  private readonly messageService = inject(MessageService);
  private readonly localSaveService = inject(LocalSaveService);

  private latestLoadedData = signal<Map<string, string>>(new Map<string, string>());

  constructor() {
    effect(() => {
      const reloadGoogle = this.googleSaveService.reloadSignal()();
      const reloadLocalStorage = this.localSaveService.reloadSignal()();
      untracked(() => {
        if (reloadGoogle || reloadLocalStorage) {
          this.loadLatestData();
        }
      });
    });
  }

  update(type: SaveType, data: any) {
    console.log('update ' + type);
    const settings = this.settingStore.settings();
    if (settings.saveMode === 'GOOGLESHEET') {
      const spreadsheetId = settings.spreadsheetId;
      if (spreadsheetId) {
        this.googleSaveService.saveData(type, spreadsheetId, data);
      } else {
        this.messageService.displayError(
          "Feuille Google non trouvée, la sauvegarde n'a pas été effectuée.",
        );
      }
    } else {
      this.localStorageService.setItem(type, data);
    }
  }

  getSignal<T>(type: SaveType, empty: T): Signal<T> {
    return computed(() => {
      const value = this.latestLoadedData().get(type);
      return untracked(() => {
        try {
          return value ? JSON.parse(value) : empty;
        } catch (error) {
          console.error('Error reading from latest data', error);
          return empty;
        }
      });
    });
  }

  removeItem(key: string): void {
    const settings = this.settingStore.settings();
    if (settings.saveMode === 'LOCAL_STORAGE') {
      localStorage.removeItem(key);
    }
  }

  loadLatestData(): Observable<boolean> {
    console.log('loadLatestData');
    return this.loadLatestDataMap().pipe(
      map((data) => {
        this.latestLoadedData.set(data);
        return true;
      }),
    );
  }

  private loadLatestDataMap(): Observable<Map<string, string>> {
    const settings = this.settingStore.settings();
    if (settings.saveMode === 'GOOGLESHEET') {
      const spreadsheetId = settings.spreadsheetId;
      if (spreadsheetId) {
        return this.googleSaveService.getAllData(spreadsheetId).pipe(
          map((data) => {
            const map = new Map<string, string>();
            for (let row of data) {
              if (row.length === 2) {
                map.set(row[0], row[1]);
              }
            }
            return map;
          }),
        );
      } else {
        return of(new Map<string, string>());
      }
    } else {
      const map = new Map<string, string>();
      for (let type of Object.values(SaveType)) {
        map.set(type, this.localStorageService.getItem(type) || '');
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
