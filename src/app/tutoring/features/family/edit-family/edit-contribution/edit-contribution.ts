import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { DateService } from '../../../../../shared/services/date-service';
import { FamilyStore } from '../../../../stores/family-store';

@Component({
  selector: 'amv-edit-contribution',
  imports: [ReactiveFormsModule, MatDatepickerInput, MatDatepickerToggle, MatDatepicker],
  templateUrl: './edit-contribution.html',
})
export class EditContribution {
  private readonly familyStore = inject(FamilyStore);
  protected readonly family = this.familyStore.selectedFamily;

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly dateService = inject(DateService);
  protected readonly dialogRef = inject<DialogRef<string>>(DialogRef);

  protected readonly validityCtrl: FormControl<Date | undefined>;

  protected readonly contributionForm: FormGroup<{
    validity: FormControl<Date | undefined>;
  }>;

  constructor() {
    const isValid = DateService.compareDays(this.family()?.contributionValidity, new Date()) >= 0;
    if (isValid) {
      this.validityCtrl = this.fb.control(
        DateService.stringToDate(this.family()?.contributionValidity),
      );
    } else {
      const inAYear = new Date();
      inAYear.setHours(0, 0, 0, 0);
      inAYear.setFullYear(inAYear.getFullYear() + 1);
      this.validityCtrl = this.fb.control(inAYear);
    }

    this.contributionForm = this.fb.group({
      validity: this.validityCtrl,
    });
  }

  validate(): void {
    if (this.contributionForm.valid) {
      let current = this.family()!;
      let validityDate = this.validityCtrl.value
        ? this.dateService.formatDate(this.validityCtrl.value)
        : undefined;
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
