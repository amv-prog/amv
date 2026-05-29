import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Toggle } from '../../../shared/components/toggle/toggle';
import { NavigationService } from '../../../shared/navigation-service';
import { RecipientMember } from '../../models/recipient-member';
import { FamilyStore } from '../../stores/family-store';

@Component({
  selector: 'amv-edit-family-member',
  imports: [ReactiveFormsModule, Toggle],
  templateUrl: './edit-family-member.html',
})
export class EditFamilyMember {
  private readonly memberStore = inject(FamilyStore);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly navigationService = inject(NavigationService);

  protected readonly family = this.memberStore.selectedFamily;
  protected readonly member = this.memberStore.selectedFamilyMember;

  protected readonly parentCtrl = this.fb.control<'LEFT' | 'RIGHT'>(
    (this.member()?.isParent ?? true) ? 'LEFT' : 'RIGHT',
    Validators.required,
  );
  protected readonly firstNameCtrl = this.fb.control(
    this.member()?.firstName || '',
    Validators.required,
  );
  protected readonly lastNameCtrl = this.fb.control(
    this.member()?.lastName || this.family()?.name || '',
    Validators.required,
  );
  protected readonly emailCtrl = this.fb.control(
    this.member()?.email || undefined,
    Validators.email,
  );

  protected readonly phonesArray = this.fb.array(
    !!this.member() && this.member()!.phoneNumbers.length > 0
      ? this.member()!.phoneNumbers.map((phoneNumber) => this.fb.control(phoneNumber))
      : [this.fb.control('')],
  );

  protected readonly memberForm = this.fb.group({
    parent: this.parentCtrl,
    firstName: this.firstNameCtrl,
    lastName: this.lastNameCtrl,
    email: this.emailCtrl,
    phones: this.phonesArray,
  });

  addPhone() {
    this.phonesArray.push(this.fb.control(''));
  }

  removePhone(index: number) {
    this.phonesArray.removeAt(index);
  }

  register(): void {
    if (this.memberForm.valid) {
      let current = this.member();
      if (!!current) {
        current = {
          ...current,
          isParent: this.parentCtrl.value === 'LEFT',
          firstName: this.firstNameCtrl.value,
          lastName: this.lastNameCtrl.value,
          email: this.emailCtrl.value,
          phoneNumbers: this.phonesArray.controls.map((ctrl) => ctrl.value).filter((v) => !!v),
        };
        this.memberStore.updateFamilyMember(current);
      } else {
        this.memberStore.updateFamilyMember(
          new RecipientMember(
            this.parentCtrl.value === 'LEFT',
            this.firstNameCtrl.value,
            this.lastNameCtrl.value,
            this.phonesArray.controls.map((ctrl) => ctrl.value).filter((v) => !!v),
            this.emailCtrl.value,
            [],
            undefined,
          ),
        );
      }
      this.navigationService.back(['tutoring', 'family', this.family()?.id]);
    }
  }

  cancel() {
    this.navigationService.back(['tutoring', 'family', this.family()?.id]);
  }
}
