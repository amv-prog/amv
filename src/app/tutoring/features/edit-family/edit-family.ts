import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavigationService } from '../../../shared/services/navigation-service';
import { Family } from '../../models/family';
import { FamilyStore } from '../../stores/family-store';

@Component({
  selector: 'amv-edit-family',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-family.html',
})
export class EditFamily {
  private readonly router = inject(Router);
  private readonly memberStore = inject(FamilyStore);
  private readonly navigationService = inject(NavigationService);

  protected readonly family = this.memberStore.selectedFamily;

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly nameCtrl = this.fb.control(this.family()?.name || '', Validators.required);
  protected readonly additionalInfoCtrl = this.fb.control(this.family()?.additionalInfo || '');

  protected readonly familyForm = this.fb.group({
    name: this.nameCtrl,
    additionalInfo: this.additionalInfoCtrl,
  });

  register(): void {
    if (this.familyForm.valid) {
      let current = this.family();
      if (!!current) {
        current = {
          ...current,
          name: this.nameCtrl.value,
          additionalInfo: this.additionalInfoCtrl.value?.trim(),
        };
        this.memberStore.updateFamily(current);
        this.navigationService.back(['tutoring', 'family', current.id]);
      } else {
        current = new Family(this.nameCtrl.value, this.additionalInfoCtrl.value?.trim());
        this.memberStore.addFamily(current);
        this.router.navigate(['tutoring', 'family', current.id]);
      }
    }
  }

  cancel() {
    this.navigationService.back(['tutoring', 'family', this.family()?.id ?? 'list']);
  }
}
