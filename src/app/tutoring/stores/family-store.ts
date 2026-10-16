import { computed, inject, linkedSignal, Service, signal, WritableSignal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Family } from '../models/family';
import { RecipientMember } from '../models/recipient-member';
import { DataService, SaveType } from '../services/data-service';

@Service()
export class FamilyStore {
  private readonly dataService = inject(DataService);

  families: WritableSignal<Family[]>;

  selectedFamilyId: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
  selectedFamilyMemberId: WritableSignal<string | undefined> = signal<string | undefined>(
    undefined,
  );

  sortedFamilies = computed(() =>
    [...this.families()].sort((f1, f2) => f1.name.localeCompare(f2.name)),
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
    this.families = linkedSignal<Family[]>(() =>
      this.dataService.getSignal<Family[]>(SaveType.FAMILIES, [])(),
    );
  }

  replaceFamilies$(families: Family[]): Observable<boolean> {
    this.families.set(families);
    return this.dataService.update$(SaveType.FAMILIES, this.families());
  }

  addFamily$(family: Family): Observable<boolean> {
    this.families.update((families) => [...families, family]);
    return this.dataService.update$(SaveType.FAMILIES, this.families());
  }

  updateFamily$(family: Family): Observable<boolean> {
    this.families.update((families) => {
      let index = families.findIndex((f) => f.id === family.id);
      if (index >= 0) {
        families.splice(index, 1, { ...family });
      }
      return [...families];
    });
    return this.dataService.update$(SaveType.FAMILIES, this.families());
  }

  removeFamily$(family: Family): Observable<boolean> {
    this.families.update((families) => {
      let index = families.indexOf(family);
      if (index >= 0) {
        families.splice(index, 1);
      }
      return [...families];
    });
    return this.dataService.update$(SaveType.FAMILIES, this.families());
  }

  setSelectedFamilyId(familyId: string | undefined) {
    this.selectedFamilyId.set(familyId);
  }

  updateFamilyMember$(member: RecipientMember): Observable<boolean> {
    const family = this.selectedFamily();
    if (!!family) {
      let mIndex = family.members.findIndex((m) => m.id === member.id);
      if (mIndex >= 0) {
        family?.members.splice(mIndex, 1, { ...member });
      } else {
        family?.members.push(member);
      }
      return this.updateFamily$(family);
    } else {
      return throwError(() => {
        const error: any = new Error('Mise à jour impossible, aucune famille sélectionnée');
        error.timestamp = Date.now();
        return error;
      });
    }
  }

  removeFamilyMember$(family: Family, member: RecipientMember): Observable<boolean> {
    let index = family.members.indexOf(member);
    if (index >= 0) {
      family.members.splice(index, 1);
    }
    return this.updateFamily$(family);
  }

  setSelectedFamilyMemberId(familyMemberId: string | undefined) {
    this.selectedFamilyMemberId.set(familyMemberId);
  }

  static sortedFamilyMembers(members: RecipientMember[]): RecipientMember[] {
    return [...members].sort((m1, m2) => Number(m2.isParent) - Number(m1.isParent));
  }
}
