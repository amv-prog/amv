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
    if (VersionStore.compare('0.1.3', oldVersion) > 0) {
      const families = this.localStorage.getItem<any[]>('families');

      if (!!families) {
        for (const family of families) {
          for (const member of family.members) {
            member.school = undefined;
            member.schoolClasses = [];
          }
        }
      }
    }
  }

  static compare(version1: string | null, version2: string | null) {
    if (version1 === version2) {
      return 0;
    } else if (version1 === null) {
      return -1;
    } else if (version2 === null) {
      return 1;
    } else {
      const parts1 = version1.replace('v', '').split('.');
      const parts2 = version2.replace('v', '').split('.');
      for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        if (parts1.length < i + 1) {
          return -1;
        } else if (parts2.length < i + 1) {
          return 1;
        } else if (Number(parts1[i]) < Number(parts2[i])) {
          return -1;
        } else if (Number(parts1[i]) > Number(parts2[i])) {
          return 1;
        }
      }
      return 0;
    }
  }
}
