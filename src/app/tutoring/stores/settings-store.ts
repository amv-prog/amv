import { effect, inject, Service, signal, WritableSignal } from '@angular/core';
import { LocalStorageService } from '../../shared/services/local-storage-service';
import { Settings } from '../models/settings';

@Service()
export class SettingsStore {
  private readonly localStorage = inject(LocalStorageService);

  settings: WritableSignal<Settings>;

  constructor() {
    this.settings = signal<Settings>(
      this.localStorage.getItem<Settings>('settings') || { saveMode: 'LOCALHOST' },
    );

    effect(() => {
      this.localStorage.setItem('settings', this.settings());
    });
  }

  updateSettings(settings: Settings) {
    console.log('Settings updated');
    this.settings.set({ ...settings });
  }
}
