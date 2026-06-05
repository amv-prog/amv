import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DateService } from '../../../shared/services/date-service';
import { TruncatePipe } from '../../../shared/truncate-pipe';
import { RecipientMember } from '../../models/recipient-member';
import { FamilyStore } from '../../stores/family-store';
import { EditContribution } from '../edit-family/edit-contribution/edit-contribution';

@Component({
  selector: 'amv-display-family',
  imports: [RouterLink, DatePipe, TruncatePipe, DialogModule],
  templateUrl: './display-family.html',
})
export class DisplayFamily {
  private readonly router = inject(Router);
  private readonly memberStore = inject(FamilyStore);

  protected readonly family = this.memberStore.selectedFamily;

  private readonly dialog = inject(Dialog);

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

  public isContributionValid(): boolean {
    return DateService.compareDays(this.family()?.contributionValidity, new Date()) >= 0;
  }

  public openContributionDialog() {
    this.dialog.open(EditContribution, {
      panelClass: 'dialog',
    });
  }
}
