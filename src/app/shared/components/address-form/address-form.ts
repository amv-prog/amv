import { Component, input } from '@angular/core';
import { applyWhen, FieldTree, FormField, required, schema } from '@angular/forms/signals';

@Component({
  selector: 'amv-address-form',
  imports: [FormField],
  templateUrl: './address-form.html',
})
export class AddressForm {
  public readonly addressField = input.required<
    FieldTree<{
      street: string;
      city: string;
      postCode: string;
      additional: string;
    }>
  >();

  public static addressSchema = schema<{
    street: string;
    city: string;
    postCode: string;
    additional: string;
  }>((address) => {
    {
      applyWhen(
        address,
        (context) => !AddressForm.isAddressNull(context.valueOf(address)),
        (address) => {
          required(address.street, { message: 'La rue est obligatoire' });
          required(address.city, { message: 'La ville est obligatoire' });
          required(address.postCode, { message: 'Le code postal est obligatoire' });
        },
      );
    }
  });

  public static isAddressNull(data: {
    street: string | null;
    city: string | null;
    postCode: string | null;
    additional: string | null;
  }) {
    return (
      !data.street?.trim() &&
      !data.city?.trim() &&
      !data.postCode?.trim() &&
      !data.additional?.trim()
    );
  }
}
