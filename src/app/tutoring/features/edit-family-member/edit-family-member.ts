import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Toggle } from '../../../shared/components/toggle/toggle';
import { DateService } from '../../../shared/services/date-service';
import { NavigationService } from '../../../shared/services/navigation-service';
import { RecipientMember } from '../../models/recipient-member';
import { FamilyStore } from '../../stores/family-store';

@Component({
  selector: 'amv-edit-family-member',
  imports: [ReactiveFormsModule, Toggle, MatDatepickerModule],
  templateUrl: './edit-family-member.html',
})
export class EditFamilyMember {
  private readonly memberStore = inject(FamilyStore);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly navigationService = inject(NavigationService);
  protected readonly dateService = inject(DateService);

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
  protected readonly birthDateCtrl = this.fb.control(
    this.dateService.stringToDate(this.member()?.birthDate),
  );
  protected readonly languagesArray = this.fb.array(
    !!this.member() && this.member()!.languages.length > 0
      ? this.member()!.languages.map((language) => this.fb.control(language))
      : [this.fb.control('')],
  );
  protected readonly additionalInfoCtrl = this.fb.control(this.member()?.additionalInfo || '');

  protected readonly memberForm = this.fb.group({
    parent: this.parentCtrl,
    firstName: this.firstNameCtrl,
    lastName: this.lastNameCtrl,
    email: this.emailCtrl,
    phones: this.phonesArray,
    birthDate: this.birthDateCtrl,
    languages: this.languagesArray,
    additionalInfo: this.additionalInfoCtrl,
  });

  addPhone() {
    this.phonesArray.push(this.fb.control(''));
  }

  removePhone(index: number) {
    this.phonesArray.removeAt(index);
  }

  addLanguage() {
    this.languagesArray.push(this.fb.control(''));
  }

  removeLanguage(index: number) {
    this.languagesArray.removeAt(index);
  }

  register(): void {
    if (this.memberForm.valid) {
      let current = this.member();
      let birthDate = this.birthDateCtrl.value
        ? this.dateService.formatDate(this.birthDateCtrl.value)
        : undefined;
      if (!!current) {
        current = {
          ...current,
          isParent: this.parentCtrl.value === 'LEFT',
          firstName: this.firstNameCtrl.value,
          lastName: this.lastNameCtrl.value,
          email: this.emailCtrl.value,
          phoneNumbers: this.phonesArray.controls.map((ctrl) => ctrl.value).filter((v) => !!v),
          birthDate: birthDate,
          languages: this.languagesArray.controls.map((ctrl) => ctrl.value).filter((v) => !!v),
          additionalInfo: this.additionalInfoCtrl.value?.trim(),
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
            this.languagesArray.controls.map((ctrl) => ctrl.value).filter((v) => !!v),
            birthDate,
            this.additionalInfoCtrl.value?.trim(),
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
