import { Component, inject, signal, WritableSignal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SignalToggle } from '../../../../shared/components/signal-toggle/signal-toggle';
import { DateService } from '../../../../shared/services/date-service';
import { NavigationService } from '../../../../shared/services/navigation-service';
import { RecipientMember } from '../../../models/recipient-member';
import { FamilyStore } from '../../../stores/family-store';

@Component({
  selector: 'amv-edit-family-member',
  imports: [MatDatepickerModule, FormRoot, SignalToggle, FormField],
  templateUrl: './edit-family-member.html',
})
export class EditFamilyMember {
  private readonly familyStore = inject(FamilyStore);
  private readonly navigationService = inject(NavigationService);
  protected readonly dateService = inject(DateService);

  protected readonly family = this.familyStore.selectedFamily;
  protected readonly member = this.familyStore.selectedFamilyMember;

  private readonly memberFormData: WritableSignal<{
    parent: 'LEFT' | 'RIGHT';
    firstName: string;
    lastName: string;
    email: string;
    phones: string[];
    birthDate: Date | null;
    languages: string[];
    additionalInfo: string;
  }> = signal({
    parent: this.member()?.isParent ? 'RIGHT' : 'LEFT',
    firstName: this.member()?.firstName || '',
    lastName: this.member()?.lastName || this.family()?.name || '',
    email: this.member()?.email || '',
    phones:
      !!this.member() && this.member()!.phoneNumbers.length > 0
        ? this.member()!.phoneNumbers
        : [''],
    birthDate: DateService.stringToDate(this.member()?.birthDate) ?? null,
    languages:
      !!this.member() && this.member()!.languages.length > 0 ? this.member()!.languages : [''],
    additionalInfo: this.member()?.additionalInfo || '',
  });

  protected readonly memberForm = form(
    this.memberFormData,
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
    this.memberFormData.update((data) => ({
      ...data,
      phones: [...data.phones, ''],
    }));
  }

  removePhone(index: number) {
    this.memberFormData.update((data) => ({
      ...data,
      phones: [...data.phones.slice(0, index), ...data.phones.slice(index + 1)],
    }));
  }

  addLanguage() {
    this.memberFormData.update((data) => ({
      ...data,
      languages: [...data.languages, ''],
    }));
  }

  removeLanguage(index: number) {
    this.memberFormData.update((data) => ({
      ...data,
      languages: [...data.languages.slice(0, index), ...data.languages.slice(index + 1)],
    }));
  }

  register(): void {
    if (this.memberForm().valid()) {
      let current = this.member();
      const formData = this.memberFormData();
      const formBirthDate = formData.birthDate;
      let birthDate = formBirthDate ? this.dateService.formatDate(formBirthDate) : undefined;
      if (!!current) {
        current = {
          ...current,
          isParent: formData.parent === 'RIGHT',
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || undefined,
          phoneNumbers: formData.phones.filter((v) => !!v),
          birthDate: birthDate,
          languages: formData.languages.filter((v) => !!v),
          additionalInfo: formData.additionalInfo.trim(),
        };
        this.familyStore.updateFamilyMember(current);
      } else {
        this.familyStore.updateFamilyMember(
          new RecipientMember(
            formData.parent === 'RIGHT',
            formData.firstName,
            formData.lastName,
            formData.phones.filter((v) => !!v),
            formData.email || undefined,
            formData.languages.filter((v) => !!v),
            birthDate,
            formData.additionalInfo.trim(),
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
