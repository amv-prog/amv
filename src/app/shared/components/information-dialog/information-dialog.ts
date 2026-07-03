import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'amv-information-dialog',
  imports: [],
  templateUrl: './information-dialog.html',
})
export class InformationDialog {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);

  data = inject(DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }
}
