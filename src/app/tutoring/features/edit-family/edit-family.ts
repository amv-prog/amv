import { AfterViewChecked, Component, inject, viewChild } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AddressForm } from '../../../shared/components/address-form/address-form';
import { NavigationService } from '../../../shared/services/navigation-service';
import { Family } from '../../models/family';
import { FamilyStore } from '../../stores/family-store';

@Component({
  selector: 'amv-edit-family',
  imports: [ReactiveFormsModule, AddressForm],
  templateUrl: './edit-family.html',
})
export class EditFamily implements AfterViewChecked {
  readonly addressForm = viewChild.required<AddressForm>(AddressForm);

  private readonly router = inject(Router);
  private readonly familyStore = inject(FamilyStore);
  private readonly navigationService = inject(NavigationService);

  protected readonly family = this.familyStore.selectedFamily;

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly nameCtrl = this.fb.control(this.family()?.name || '', Validators.required);
  protected readonly additionalInfoCtrl = this.fb.control(this.family()?.additionalInfo || '');

  protected readonly familyForm = this.fb.group({
    name: this.nameCtrl,
    additionalInfo: this.additionalInfoCtrl,
    address: this.fb.array<FormGroup>([]),
  });

  ngAfterViewChecked(): void {
    this.familyForm.controls.address.push(this.addressForm().getFormGroup());
  }

  register(): void {
    if (this.familyForm.valid) {
      let current = this.family();
      if (!!current) {
        current = {
          ...current,
          name: this.nameCtrl.value,
          additionalInfo: this.additionalInfoCtrl.value?.trim(),
          address: this.addressForm().getAddress(),
        };
        this.familyStore.updateFamily(current);
        this.navigationService.back(['tutoring', 'family', current.id]);
      } else {
        current = new Family(
          this.nameCtrl.value,
          this.additionalInfoCtrl.value?.trim(),
          this.addressForm().getAddress(),
        );
        this.familyStore.addFamily(current);
        this.router.navigate(['tutoring', 'family', current.id]);
      }
    }
  }

  cancel() {
    this.navigationService.back(['tutoring', 'family', this.family()?.id ?? 'list']);
  }
}
