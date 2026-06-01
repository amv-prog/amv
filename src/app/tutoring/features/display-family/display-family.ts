import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TruncatePipe } from '../../../shared/truncate-pipe';
import { RecipientMember } from '../../models/recipient-member';
import { FamilyStore } from '../../stores/family-store';

@Component({
  selector: 'amv-display-family',
  imports: [RouterLink, DatePipe, TruncatePipe],
  templateUrl: './display-family.html',
})
export class DisplayFamily {
  private readonly router = inject(Router);
  private readonly memberStore = inject(FamilyStore);

  protected readonly family = this.memberStore.selectedFamily;

  public removeFamilyMember(member: RecipientMember) {
    this.memberStore.removeFamilyMember(this.family()!, member);
  }

  public removeFamily() {
    this.memberStore.removeFamily(this.family()!);
    this.router.navigate(['tutoring', 'family', 'list']);
  }

  public sortedFamilyMembers(members: RecipientMember[]): RecipientMember[] {
    return FamilyStore.sortedFamilyMembers(members);
  }
}
