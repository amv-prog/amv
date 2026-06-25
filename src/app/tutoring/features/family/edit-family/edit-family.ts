import { Component, inject, signal, WritableSignal } from '@angular/core';
import { apply, FieldTree, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AddressForm } from '../../../../shared/components/address-form/address-form';
import { Address } from '../../../../shared/models/address';
import { NavigationService } from '../../../../shared/services/navigation-service';
import { Family } from '../../../models/family';
import { FamilyStore } from '../../../stores/family-store';

@Component({
  selector: 'amv-edit-family',
  imports: [AddressForm, FormRoot, FormField],
  templateUrl: './edit-family.html',
})
export class EditFamily {
  private readonly router = inject(Router);
  private readonly familyStore = inject(FamilyStore);
  private readonly navigationService = inject(NavigationService);

  protected readonly family = this.familyStore.selectedFamily;

  private readonly familyFormData: WritableSignal<{
    name: string;
    additionalInfo: string;
    address: {
      street: string;
      city: string;
      postCode: string;
      additional: string;
    };
  }> = signal({
    name: this.family()?.name || '',
    additionalInfo: this.family()?.additionalInfo || '',
    address: {
      street: this.family()?.address?.street || '',
      city: this.family()?.address?.city || '',
      postCode: this.family()?.address?.postCode || '',
      additional: this.family()?.address?.additional || '',
    },
  });

  protected readonly familyForm: FieldTree<
    {
      name: string;
      additionalInfo: string;
      address: {
        street: string;
        city: string;
        postCode: string;
        additional: string;
      };
    },
    string | number,
    'writable'
  > = form(
    this.familyFormData,
    (form) => {
      (required(form.name, { message: 'Le nom est obligatoire' }),
        apply(form.address, AddressForm.addressSchema));
    },
    {
      submission: {
        action: async () => this.register(),
        ignoreValidators: 'none',
      },
    },
  );

  register(): void {
    if (this.familyForm().valid()) {
      let current = this.family();
      const formData = this.familyFormData();
      if (!!current) {
        current = {
          ...current,
          name: formData.name,
          additionalInfo: formData.additionalInfo.trim(),
          address: this.getAddress(),
        };
        this.familyStore.updateFamily(current);
        this.navigationService.back(['tutoring', 'family', current.id]);
      } else {
        current = new Family(formData.name, formData.additionalInfo.trim(), this.getAddress());
        this.familyStore.addFamily(current);
        this.router.navigate(['tutoring', 'family', current.id]);
      }
    }
  }

  private getAddress(): Address | undefined {
    if (this.familyForm.address().valid()) {
      const addressData = this.familyFormData().address;
      if (AddressForm.isAddressNull(this.familyFormData().address)) {
        return undefined;
      } else {
        return new Address(
          addressData.street,
          addressData.postCode,
          addressData.city,
          addressData.additional,
        );
      }
    } else {
      return undefined;
    }
  }

  cancel() {
    this.navigationService.back(['tutoring', 'family', this.family()?.id ?? 'list']);
  }
}
