import { effect, inject, Service, signal, WritableSignal } from '@angular/core';
import { GoogleDocInfo } from '../../shared/models/google-doc-info';
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

  updateSpreadsheet(spreadsheet: GoogleDocInfo | undefined) {
    this.settings.update((settings) => {
      return { ...settings, spreadsheet };
    });
  }
}
