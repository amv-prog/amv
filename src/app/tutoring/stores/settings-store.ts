import { effect, inject, Service, signal, WritableSignal } from '@angular/core';
import { LocalStorageService } from '../../shared/services/local-storage-service';
import { Settings } from '../models/settings';

@Service()
export class SettingsStore {
  private readonly localStorage = inject(LocalStorageService);

  settings: WritableSignal<Settings>;

  constructor() {
    this.settings = signal<Settings>(this.localStorage.getItem<Settings>('settings') || {});

    effect(() => {
      this.localStorage.setItem('settings', this.settings());
    });
  }

  updateSettings(settings: Settings) {
    this.settings.set({ ...settings });
  }

  updateSpreadsheet(spreadsheetId: string | undefined) {
    this.settings.update((settings) => {
      return { ...settings, spreadsheetId };
    });
  }
}
