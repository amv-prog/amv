import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Toggle } from '../../../shared/components/toggle/toggle';
import { NavigationService } from '../../../shared/services/navigation-service';
import { VolunteerMember } from '../../models/volunteer-member';
import { VolunteerStore } from '../../stores/volunteer-store';

@Component({
  selector: 'amv-edit-volunteer',
  imports: [ReactiveFormsModule, Toggle],
  templateUrl: './edit-volunteer.html',
})
export class EditVolunteer {
  private readonly volunteerStore = inject(VolunteerStore);

  protected readonly volunteer = this.volunteerStore.selectedVolunteer;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly navigationService = inject(NavigationService);
  private readonly router = inject(Router);

  protected readonly firstNameCtrl = this.fb.control(
    this.volunteer()?.firstName || '',
    Validators.required,
  );
  protected readonly lastNameCtrl = this.fb.control(
    this.volunteer()?.lastName || '',
    Validators.required,
  );
  protected readonly tutorCtrl = this.fb.control<'LEFT' | 'RIGHT'>(
    (this.volunteer()?.isTutor ?? true) ? 'LEFT' : 'RIGHT',
    Validators.required,
  );
  protected readonly emailCtrl = this.fb.control(
    this.volunteer()?.email || undefined,
    Validators.email,
  );
  protected readonly phonesArray = this.fb.array(
    !!this.volunteer() && this.volunteer()!.phoneNumbers.length > 0
      ? this.volunteer()!.phoneNumbers.map((phoneNumber) => this.fb.control(phoneNumber))
      : [this.fb.control('')],
  );
  protected readonly languagesArray = this.fb.array(
    !!this.volunteer() && this.volunteer()!.languages.length > 0
      ? this.volunteer()!.languages.map((language) => this.fb.control(language))
      : [this.fb.control('')],
  );
  protected readonly additionalInfoCtrl = this.fb.control(this.volunteer()?.additionalInfo || '');

  protected readonly volunteerForm = this.fb.group({
    tutor: this.tutorCtrl,
    firstName: this.firstNameCtrl,
    lastName: this.lastNameCtrl,
    email: this.emailCtrl,
    phones: this.phonesArray,
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
    if (this.volunteerForm.valid) {
      let current = this.volunteer();
      if (!!current) {
        current = {
          ...current,
          isTutor: this.tutorCtrl.value === 'LEFT',
          firstName: this.firstNameCtrl.value,
          lastName: this.lastNameCtrl.value,
          email: this.emailCtrl.value,
          phoneNumbers: this.phonesArray.controls.map((ctrl) => ctrl.value).filter((v) => !!v),
          languages: this.languagesArray.controls.map((ctrl) => ctrl.value).filter((v) => !!v),
          additionalInfo: this.additionalInfoCtrl.value?.trim(),
        };
        this.volunteerStore.updateVolunteer(current);
        this.navigationService.back(['tutoring', 'volunteer', 'list']);
      } else {
        current = new VolunteerMember(
          this.tutorCtrl.value === 'LEFT',
          this.firstNameCtrl.value,
          this.lastNameCtrl.value,
          this.phonesArray.controls.map((ctrl) => ctrl.value).filter((v) => !!v),
          this.emailCtrl.value,
          this.languagesArray.controls.map((ctrl) => ctrl.value).filter((v) => !!v),
          this.additionalInfoCtrl.value?.trim(),
        );
        this.volunteerStore.addVolunteer(current);
        this.router.navigate(['tutoring', 'volunteer', 'list']);
      }
    }
  }

  cancel() {
    this.navigationService.back(['tutoring', 'volunteer', 'list']);
  }
}
