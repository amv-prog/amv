import { inject, Service } from '@angular/core';
import { LocalStorageService } from '../../shared/services/local-storage-service';
import { MessageService } from '../../shared/services/message-service';
import { SettingsStore } from '../stores/settings-store';
import { GoogleSaveService } from './google-save-service';

@Service()
export class SaveService {
  private readonly settingStore = inject(SettingsStore);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly googleSaveService = inject(GoogleSaveService);
  private readonly messageService = inject(MessageService);

  update(type: SaveType, data: any) {
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

  getItem<T>(type: SaveType): T | null {
    const settings = this.settingStore.settings();
    if (settings.saveMode === 'GOOGLESHEET') {
      return null;
    } else {
      return this.localStorageService.getItem<T>(type);
    }
  }

  removeItem(key: string): void {
    const settings = this.settingStore.settings();
    if (settings.saveMode === 'LOCAL_STORAGE') {
      localStorage.removeItem(key);
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
