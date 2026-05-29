import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Family } from '../../models/family';
import { RecipientMember } from '../../models/recipient-member';
import { FamilyStore } from '../../stores/family-store';

@Component({
  selector: 'amv-family-list',
  imports: [RouterLink],
  templateUrl: './family-list.html',
})
export class FamilyList {
  private readonly router = inject(Router);

  protected readonly memberStore = inject(FamilyStore);

  protected readonly familiesToDisplay = computed(() =>
    this.memberStore.families().map((f) => new FamilyDisplay(f, true)),
  );

  public displayFamily(family: Family) {
    this.router.navigate(['tutoring', 'family', family.id]);
  }

  public removeFamilyMember(family: Family, member: RecipientMember) {
    this.memberStore.removeFamilyMember(family, member);
  }

  public switchExpanded(familyDisplay: FamilyDisplay) {
    familyDisplay.expanded = !familyDisplay.expanded;
  }

  public removeFamily(family: Family) {
    this.memberStore.removeFamily(family);
  }

  public sortedFamilyMembers(members: RecipientMember[]): RecipientMember[] {
    return FamilyStore.sortedFamilyMembers(members);
  }
}

class FamilyDisplay {
  constructor(
    public family: Family,
    public expanded: boolean,
  ) {}
}
