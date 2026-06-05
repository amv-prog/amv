import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'amv-confirmation-dialog',
  imports: [],
  templateUrl: './confirmation-dialog.html',
})
export class ConfirmationDialog {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);

  data = inject(DIALOG_DATA);

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
