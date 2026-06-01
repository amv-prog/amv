import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import * as packageJson from 'packageJson';
import { LocalStorageService } from './services/local-storage-service';

@Injectable({
  providedIn: 'root',
})
export class VersionStore {
  private readonly localStorage = inject(LocalStorageService);
  version: WritableSignal<string>;

  constructor() {
    this.updateStorage(this.localStorage.getItem<string>('version'));
    this.version = signal<string>(packageJson.version);

    effect(() => {
      this.localStorage.setItem('version', this.version());
    });
  }

  updateStorage(oldVersion: string | null) {
    if (!oldVersion) {
      this.localStorage.removeItem('members');
    }
  }
}
