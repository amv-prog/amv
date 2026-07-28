import { Dialog } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { FamilyStore } from '../../../stores/family-store';
import { RecipientLessons } from './recipient-lessons/recipient-lessons';

@Component({
  selector: 'amv-display-family-member',
  imports: [DatePipe, RouterLink, RecipientLessons],
  templateUrl: './display-family-member.html',
})
export class DisplayFamilyMember {
  private readonly familyStore = inject(FamilyStore);
  private readonly router = inject(Router);

  private readonly dialog = inject(Dialog);

  protected readonly member = this.familyStore.selectedFamilyMember;
  protected readonly family = this.familyStore.selectedFamily;

  goToFamily() {
    this.router.navigate(['tutoring', 'family', this.family()?.id]);
  }

  public validateMemberRemoval() {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: `Souhaitez-vous supprimer ${this.member()!.firstName} ${this.member()!.lastName} ?`,
      },
    });

    dialogRef.closed
      .pipe(
        tap((result) => {
          if (!!result) {
            this.removeMember();
          }
        }),
      )
      .subscribe();
  }

  private removeMember() {
    this.familyStore.removeFamilyMember(this.family()!, this.member()!);
    this.router.navigate(['tutoring', 'family', this.family()!.id]);
  }
}
