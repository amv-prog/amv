import { Dialog } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { BreakpointService } from '../../../../shared/services/breakpoint-service';
import { TruncatePipe } from '../../../../shared/truncate-pipe';
import { VolunteerMember } from '../../../models/volunteer-member';
import { SettingsStore } from '../../../stores/settings-store';
import { VolunteerStore } from '../../../stores/volunteer-store';
import { ExportVolunteers } from '../export-volunteers/export-volunteers';
@Component({
  selector: 'amv-volunteer-list',
  imports: [TruncatePipe, RouterLink],
  templateUrl: './volunteer-list.html',
})
export class VolunteerList {
  protected readonly volunteerStore = inject(VolunteerStore);
  protected readonly settingsStore = inject(SettingsStore);

  private readonly breakpointService = inject(BreakpointService);
  protected readonly isMaxMedium = this.breakpointService.isMaxMedium;
  protected readonly isXSmall = this.breakpointService.isXSmall;

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
        filter((result) => !!result),
        switchMap(() => this.volunteerStore.removeVolunteer$(volunteer)),
      )
      .subscribe();
  }

  export() {
    this.dialog.open<boolean>(ExportVolunteers, {
      panelClass: this.dialogPanelClass(),
    });
  }

  private dialogPanelClass(): string[] {
    const panelClass = ['dialog'];
    if (this.isXSmall()) {
      panelClass.push('is-x-small');
    }
    return panelClass;
  }
}
