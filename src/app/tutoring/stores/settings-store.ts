import { effect, inject, Service, signal, WritableSignal } from '@angular/core';
import { GoogleDocInfo } from '../../shared/models/google-doc-info';
import { LocalStorageService } from '../../shared/services/local-storage-service';
import { Settings } from '../models/settings';

@Service()
export class SettingsStore {
  private readonly localStorage = inject(LocalStorageService);

  settings: WritableSignal<Settings>;

  constructor() {
    this.settings = signal<Settings>(
      this.localStorage.getItem<Settings>('settings') || { saveMode: 'LOCAL_STORAGE' },
    );

    effect(() => {
      this.localStorage.setItem('settings', this.settings());
    });
  }

  updateSettings(settings: Settings) {
    this.settings.set({ ...settings });
  }

  updateSaveMode(saveMode: 'LOCAL_STORAGE' | 'GOOGLESHEET') {
    this.settings.update((settings) => {
      return { ...settings, saveMode };
    });
  }

  updateSpreadsheet(spreadsheet: GoogleDocInfo) {
    this.settings.update((settings) => {
      return { ...settings, spreadsheet };
    });
  }
}
