import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import * as packageJson from 'packageJson';
import { DataService, SaveType } from '../tutoring/services/data-service';

@Injectable({
  providedIn: 'root',
})
export class VersionStore {
  private readonly dataService = inject(DataService);
  version: WritableSignal<string>;

  constructor() {
    this.updateStorage(this.dataService.getSignal<string>(SaveType.VERSION, '')());
    this.version = signal<string>(packageJson.version);

    /* effect(() => {
      this.dataService.update(SaveType.VERSION, this.version());
    }); */
  }

  updateStorage(oldVersion: string | null) {
    /* if (!oldVersion) {
      this.saveService.removeItem('members');
    }
    if (VersionStore.compare('0.1.2', oldVersion) > 0) {
      const families = this.saveService.getSignal<any[]>(SaveType.FAMILIES, [])();

      if (!!families) {
        for (const family of families) {
          for (const member of family.members) {
            member.schoolClassIds = [];
          }
        }
      }
      this.saveService.update(SaveType.FAMILIES, families);
    } */
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
