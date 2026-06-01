import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { LocalStorageService } from '../../shared/services/local-storage-service';
import { Family } from '../models/family';
import { RecipientMember } from '../models/recipient-member';

@Injectable({
  providedIn: 'root',
})
export class FamilyStore {
  private readonly localStorage = inject(LocalStorageService);

  families: WritableSignal<Family[]>;

  selectedFamily: WritableSignal<Family | undefined> = signal<Family | undefined>(undefined);
  selectedFamilyMember: WritableSignal<RecipientMember | undefined> = signal<
    RecipientMember | undefined
  >(undefined);

  constructor() {
    this.families = signal<Family[]>(this.localStorage.getItem<Family[]>('families') || []);

    effect(() => {
      this.localStorage.setItem('families', this.families());
    });
  }

  addFamily(family: Family) {
    this.families.update((families) => [...families, family]);
  }

  updateFamily(family: Family) {
    this.families.update((families) => {
      let index = families.findIndex((f) => f.id === family.id);
      if (index >= 0) {
        families.splice(index, 1, family);
      }
      return [...families];
    });
  }

  removeFamily(family: Family) {
    this.families.update((families) => {
      let index = families.indexOf(family);
      if (index >= 0) {
        families.splice(index, 1);
      }
      return [...families];
    });
  }

  setSelectedFamily(family: Family | undefined) {
    this.selectedFamily.set(family);
  }

  updateFamilyMember(member: RecipientMember) {
    const family = this.selectedFamily();
    if (!!family) {
      let mIndex = family.members.findIndex((m) => m.id === member.id);
      if (mIndex >= 0) {
        family?.members.splice(mIndex, 1, member);
      } else {
        family?.members.push(member);
      }
      this.updateFamily(family);
    }
  }

  removeFamilyMember(family: Family, member: RecipientMember) {
    let index = family.members.indexOf(member);
    if (index >= 0) {
      family.members.splice(index, 1);
    }
    this.updateFamily(family);
  }

  setSelectedFamilyMember(familyMember: RecipientMember | undefined) {
    this.selectedFamilyMember.set(familyMember);
  }

  static sortedFamilyMembers(members: RecipientMember[]): RecipientMember[] {
    return [...members].sort((m1, m2) => Number(m2.isParent) - Number(m1.isParent));
  }
}
