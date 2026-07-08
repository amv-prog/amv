import { Dialog } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { TruncatePipe } from '../../../../shared/truncate-pipe';
import { VolunteerMember } from '../../../models/volunteer-member';
import { VolunteerStore } from '../../../stores/volunteer-store';
@Component({
  selector: 'amv-volunteer-list',
  imports: [TruncatePipe, RouterLink],
  templateUrl: './volunteer-list.html',
})
export class VolunteerList {
  protected readonly volunteerStore = inject(VolunteerStore);

  protected readonly volunteers = this.volunteerStore.sortedVolunteers;

  private readonly dialog = inject(Dialog);

  public validateVolunteerRemoval(volunteer: VolunteerMember) {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: `Souhaitez-vous supprimer ${volunteer.firstName} ${volunteer.lastName} ?`,
      },
    });

    dialogRef.closed
      .pipe(
        tap((result) => {
          if (!!result) {
            this.removeVolunteer(volunteer);
          }
        }),
      )
      .subscribe();
  }

  private removeVolunteer(volunteer: VolunteerMember) {
    this.volunteerStore.removeVolunteer(volunteer);
  }
}
