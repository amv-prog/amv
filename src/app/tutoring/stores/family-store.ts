import { computed, effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { LocalStorageService } from '../../shared/services/local-storage-service';
import { Family } from '../models/family';
import { RecipientMember } from '../models/recipient-member';

@Injectable({
  providedIn: 'root',
})
export class FamilyStore {
  private readonly localStorage = inject(LocalStorageService);

  families: WritableSignal<Family[]>;

  selectedFamilyId: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
  selectedFamilyMemberId: WritableSignal<string | undefined> = signal<string | undefined>(
    undefined,
  );

  childrenMap = computed(() => {
    const families = this.families();
    return new Map(
      families.flatMap((family) =>
        family.members
          .filter((member) => !member.isParent)
          .map((member) => [member.id, { member, family }]),
      ),
    );
  });

  selectedFamily = computed(() => {
    const familyId = this.selectedFamilyId();
    if (!!familyId) {
      return this.families().find((f) => f.id === familyId);
    } else {
      return undefined;
    }
  });

  selectedFamilyMember = computed(() => {
    const familyMemberId = this.selectedFamilyMemberId();
    if (!!familyMemberId) {
      return this.selectedFamily()?.members.find((m) => m.id === familyMemberId);
    } else {
      return undefined;
    }
  });

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
        families.splice(index, 1, { ...family });
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

  setSelectedFamilyId(familyId: string | undefined) {
    this.selectedFamilyId.set(familyId);
  }

  updateFamilyMember(member: RecipientMember) {
    const family = this.selectedFamily();
    if (!!family) {
      let mIndex = family.members.findIndex((m) => m.id === member.id);
      if (mIndex >= 0) {
        family?.members.splice(mIndex, 1, { ...member });
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

  setSelectedFamilyMemberId(familyMemberId: string | undefined) {
    this.selectedFamilyMemberId.set(familyMemberId);
  }

  static sortedFamilyMembers(members: RecipientMember[]): RecipientMember[] {
    return [...members].sort((m1, m2) => Number(m2.isParent) - Number(m1.isParent));
  }
}
