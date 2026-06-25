import { Component, inject, signal, WritableSignal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Toggle } from '../../../../shared/components/toggle/toggle';
import { NavigationService } from '../../../../shared/services/navigation-service';
import { VolunteerMember } from '../../../models/volunteer-member';
import { VolunteerStore } from '../../../stores/volunteer-store';

@Component({
  selector: 'amv-edit-volunteer',
  imports: [FormRoot, Toggle, FormField],
  templateUrl: './edit-volunteer.html',
})
export class EditVolunteer {
  private readonly volunteerStore = inject(VolunteerStore);

  protected readonly volunteer = this.volunteerStore.selectedVolunteer;

  private readonly navigationService = inject(NavigationService);
  private readonly router = inject(Router);

  private readonly volunteerFormData: WritableSignal<{
    tutor: 'LEFT' | 'RIGHT';
    firstName: string;
    lastName: string;
    email: string;
    phones: string[];
    languages: string[];
    additionalInfo: string;
  }> = signal({
    tutor: (this.volunteer()?.isTutor ?? true) ? 'LEFT' : 'RIGHT',
    firstName: this.volunteer()?.firstName || '',
    lastName: this.volunteer()?.lastName || '',
    email: this.volunteer()?.email || '',
    phones:
      !!this.volunteer() && this.volunteer()!.phoneNumbers.length > 0
        ? this.volunteer()!.phoneNumbers
        : [''],
    languages:
      !!this.volunteer() && this.volunteer()!.languages.length > 0
        ? this.volunteer()!.languages
        : [''],
    additionalInfo: this.volunteer()?.additionalInfo || '',
  });

  protected readonly volunteerForm = form(
    this.volunteerFormData,
    (form) => {
      required(form.firstName, { message: 'Le prénom est obligatoire' });
      required(form.lastName, { message: 'Le nom de famille est obligatoire' });
      email(form.email, { message: "L'email saisi n'est pas valide" });
    },
    {
      submission: {
        action: async () => this.register(),
        ignoreValidators: 'none',
      },
    },
  );

  addPhone() {
    this.volunteerFormData.update((data) => ({
      ...data,
      phones: [...data.phones, ''],
    }));
  }

  removePhone(index: number) {
    this.volunteerFormData.update((data) => ({
      ...data,
      phones: [...data.phones.slice(0, index), ...data.phones.slice(index + 1)],
    }));
  }

  addLanguage() {
    this.volunteerFormData.update((data) => ({
      ...data,
      languages: [...data.languages, ''],
    }));
  }

  removeLanguage(index: number) {
    this.volunteerFormData.update((data) => ({
      ...data,
      languages: [...data.languages.slice(0, index), ...data.languages.slice(index + 1)],
    }));
  }

  register(): void {
    if (this.volunteerForm().valid()) {
      let current = this.volunteer();
      const formData = this.volunteerFormData();
      if (!!current) {
        current = {
          ...current,
          isTutor: formData.tutor === 'LEFT',
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || undefined,
          phoneNumbers: formData.phones.filter((v) => !!v),
          languages: formData.languages.filter((v) => !!v),
          additionalInfo: formData.additionalInfo.trim(),
        };
        this.volunteerStore.updateVolunteer(current);
        this.navigationService.back(['tutoring', 'volunteer', 'list']);
      } else {
        current = new VolunteerMember(
          formData.tutor === 'LEFT',
          formData.firstName,
          formData.lastName,
          formData.phones.filter((v) => !!v),
          formData.email || undefined,
          formData.languages.filter((v) => !!v),
          formData.additionalInfo.trim(),
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
