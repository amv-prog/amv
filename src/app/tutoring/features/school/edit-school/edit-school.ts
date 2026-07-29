import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { School } from '../../../models/school';
import { SchoolStore } from '../../../stores/school-store';

@Component({
  selector: 'amv-edit-school',
  imports: [FormRoot, FormField],
  templateUrl: './edit-school.html',
})
export class EditSchool {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly schoolStore = inject(SchoolStore);

  data = inject(DIALOG_DATA);

  protected readonly school = this.data?.school as School | undefined;

  private readonly schoolFormData: WritableSignal<{
    name: string;
    additionalInfo: string;
  }> = signal({
    name: this.school?.name || '',
    additionalInfo: this.school?.additionalInfo || '',
  });

  protected readonly schoolForm = form(
    this.schoolFormData,
    (form) => {
      required(form.name, { message: 'Le nom est obligatoire' });
    },
    {
      submission: {
        action: async () => this.register(),
        ignoreValidators: 'none',
      },
    },
  );

  register(): void {
    if (this.schoolForm().valid()) {
      let current = this.school;
      const formData = this.schoolFormData();
      if (!!current) {
        current = {
          ...current,
          name: formData.name,
          additionalInfo: formData.additionalInfo.trim(),
        };
        this.schoolStore.updateSchool(current);
        this.dialogRef.close(true);
      } else {
        current = new School(formData.name, formData.additionalInfo);
        this.schoolStore.addSchool(current);
        this.dialogRef.close(true);
      }
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
