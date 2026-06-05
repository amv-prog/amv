import { Dialog } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog';
import { DateService } from '../../../shared/services/date-service';
import { TruncatePipe } from '../../../shared/truncate-pipe';
import { Family } from '../../models/family';
import { RecipientMember } from '../../models/recipient-member';
import { FamilyStore } from '../../stores/family-store';

@Component({
  selector: 'amv-family-list',
  imports: [RouterLink, DatePipe, TruncatePipe],
  templateUrl: './family-list.html',
})
export class FamilyList {
  private readonly router = inject(Router);

  protected readonly memberStore = inject(FamilyStore);

  private readonly dialog = inject(Dialog);

  protected readonly familiesToDisplay = computed(() =>
    this.memberStore.families().map((f) => new FamilyDisplay(f, true)),
  );

  public displayFamily(family: Family) {
    this.router.navigate(['tutoring', 'family', family.id]);
  }

  public validateFamilyMemberRemoval(family: Family, member: RecipientMember) {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: `Souhaitez-vous supprimer ${member.firstName} ${member.lastName} ?`,
      },
    });

    dialogRef.closed
      .pipe(
        tap((result) => {
          if (!!result) {
            this.removeFamilyMember(family, member);
          }
        }),
      )
      .subscribe();
  }

  private removeFamilyMember(family: Family, member: RecipientMember) {
    this.memberStore.removeFamilyMember(family, member);
  }

  public switchExpanded(familyDisplay: FamilyDisplay) {
    familyDisplay.expanded = !familyDisplay.expanded;
  }

  public validateFamilyRemoval(family: Family, event: Event) {
    event.stopPropagation();
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: `Souhaitez-vous supprimer la famille ${family.name}, ainsi que tous ses membres ?`,
      },
    });

    dialogRef.closed
      .pipe(
        tap((result) => {
          if (!!result) {
            this.removeFamily(family);
          }
        }),
      )
      .subscribe();
  }

  private removeFamily(family: Family) {
    this.memberStore.removeFamily(family);
  }

  public sortedFamilyMembers(members: RecipientMember[]): RecipientMember[] {
    return FamilyStore.sortedFamilyMembers(members);
  }

  public isContributionValid(family: Family) {
    return DateService.compareDays(family.contributionValidity, new Date()) >= 0;
  }
}

class FamilyDisplay {
  constructor(
    public family: Family,
    public expanded: boolean,
  ) {}
}
