import { Component, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { Address } from '../../models/address';

@Component({
  selector: 'amv-address-form',
  imports: [ReactiveFormsModule],
  templateUrl: './address-form.html',
})
export class AddressForm implements OnInit {
  public readonly address = input<Address | undefined>();
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly streetCtrl = this.fb.control<string | undefined>(undefined);
  protected readonly cityCtrl = this.fb.control<string | undefined>(undefined);
  protected readonly postCodeCtrl = this.fb.control<string | undefined>(undefined);
  protected readonly additionalCtrl = this.fb.control<string | undefined>(undefined);

  protected readonly addressFormGroup = this.fb.group({
    street: this.streetCtrl,
    city: this.cityCtrl,
    postCode: this.postCodeCtrl,
    additional: this.additionalCtrl,
  });

  constructor() {
    this.streetCtrl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => {
          this.updateValidators();
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
    this.cityCtrl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => {
          this.updateValidators();
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
    this.postCodeCtrl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => {
          this.updateValidators();
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
    this.additionalCtrl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => {
          this.updateValidators();
        }),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.updateValidators();
  }

  ngOnInit(): void {
    this.streetCtrl.setValue(this.address()?.street);
    this.postCodeCtrl.setValue(this.address()?.postCode);
    this.cityCtrl.setValue(this.address()?.city);
    this.additionalCtrl.setValue(this.address()?.additional);
  }

  private isAddressNull(
    street: string | undefined = this.streetCtrl.value,
    city: string | undefined = this.cityCtrl.value,
    postCode: string | undefined = this.postCodeCtrl.value,
    additional: string | undefined = this.additionalCtrl.value,
  ) {
    return !street?.trim() && !city?.trim() && !postCode?.trim() && !additional?.trim();
  }

  private updateValidators() {
    if (this.isAddressNull()) {
      this.streetCtrl.clearValidators();
      this.cityCtrl.clearValidators();
      this.postCodeCtrl.clearValidators();
    } else {
      this.streetCtrl.setValidators(Validators.required);
      this.cityCtrl.setValidators(Validators.required);
      this.postCodeCtrl.setValidators(Validators.required);
    }
    this.streetCtrl.updateValueAndValidity();
    this.cityCtrl.updateValueAndValidity();
    this.postCodeCtrl.updateValueAndValidity();
  }

  public getFormGroup(): FormGroup {
    return this.addressFormGroup;
  }

  public getAddress(): Address | undefined {
    if (this.addressFormGroup.valid) {
      if (this.isAddressNull()) {
        return undefined;
      } else {
        return new Address(
          this.streetCtrl.value!,
          this.postCodeCtrl.value!,
          this.cityCtrl.value!,
          this.additionalCtrl.value,
        );
      }
    } else {
      return undefined;
    }
  }
}
