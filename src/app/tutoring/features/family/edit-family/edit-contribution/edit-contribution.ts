import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FieldTree, form, FormField, FormRoot } from '@angular/forms/signals';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { DateService } from '../../../../../shared/services/date-service';
import { FamilyStore } from '../../../../stores/family-store';

@Component({
  selector: 'amv-edit-contribution',
  imports: [MatDatepickerInput, MatDatepickerToggle, MatDatepicker, FormRoot, FormField],
  templateUrl: './edit-contribution.html',
})
export class EditContribution {
  private readonly familyStore = inject(FamilyStore);
  protected readonly family = this.familyStore.selectedFamily;

  protected readonly dateService = inject(DateService);
  protected readonly dialogRef = inject<DialogRef<string>>(DialogRef);

  private readonly contributionFormData: WritableSignal<{
    validity: Date | null;
  }>;

  protected readonly contributionForm: FieldTree<
    {
      validity: Date | null;
    },
    string | number,
    'writable'
  >;

  constructor() {
    const isValid = DateService.compareDays(this.family()?.contributionValidity, new Date()) >= 0;
    if (isValid) {
      this.contributionFormData = signal({
        validity: DateService.stringToDate(this.family()?.contributionValidity) ?? null,
      });
    } else {
      const inAYear = new Date();
      inAYear.setHours(0, 0, 0, 0);
      inAYear.setFullYear(inAYear.getFullYear() + 1);
      this.contributionFormData = signal({
        validity: inAYear,
      });
    }

    this.contributionForm = form(this.contributionFormData, {
      submission: {
        action: async () => this.validate(),
        ignoreValidators: 'none',
      },
    });
  }

  private validate(): void {
    if (this.contributionForm().valid()) {
      let current = this.family()!;
      let formValidity = this.contributionFormData().validity;
      let validityDate = formValidity ? this.dateService.formatDate(formValidity) : undefined;
      current = {
        ...current,
        contributionValidity: validityDate,
      };
      this.familyStore.updateFamily(current);
      this.dialogRef.close();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
