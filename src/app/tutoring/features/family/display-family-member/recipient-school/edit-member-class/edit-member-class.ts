import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { disabled, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { FamilyStore } from '../../../../../stores/family-store';
import { SchoolStore } from '../../../../../stores/school-store';
import { EditClass } from '../../../../school/edit-class/edit-class';
import { EditSchool } from '../../../../school/edit-school/edit-school';

@Component({
  selector: 'amv-edit-member-class',
  imports: [FormRoot, FormField],
  templateUrl: './edit-member-class.html',
})
export class EditMemberClass {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly dialog = inject(Dialog);

  data = inject(DIALOG_DATA);

  protected readonly classId = this.data?.classId as string | undefined;

  private readonly familyStore = inject(FamilyStore);
  private readonly schoolStore = inject(SchoolStore);
  protected readonly member = this.familyStore.selectedFamilyMember;

  protected readonly initialSchoolClassObject = computed(() => {
    return !!this.classId ? this.schoolStore.findSchoolClassObject(this.classId)() : undefined;
  });

  private readonly schoolClassFormData: WritableSignal<{
    schoolId: string;
    year: string;
    classId: string;
  }> = signal({
    schoolId: this.initialSchoolClassObject()?.school.id || '',
    year: this.initialSchoolClassObject()?.schoolClass.year.toString() || '',
    classId: this.initialSchoolClassObject()?.schoolClass.id || '',
  });

  protected readonly schoolClassForm = form(
    this.schoolClassFormData,
    (form) => {
      required(form.schoolId, { message: "L'école est obligatoire" });
      required(form.year, { message: "L'année est obligatoire" });
      required(form.classId, { message: 'La classe est obligatoire' });
      disabled(form.year, {
        when: ({ stateOf }) => {
          return !stateOf(form.schoolId).valid();
        },
      });
      disabled(form.classId, {
        when: ({ stateOf }) => {
          return !stateOf(form.schoolId).valid() || !stateOf(form.year).valid();
        },
      });
    },
    {
      submission: {
        action: async () => this.validate(),
        ignoreValidators: 'none',
      },
    },
  );

  protected readonly schools = this.schoolStore.schools;

  protected readonly selectedSchool = computed(() => {
    return this.schools().find((s) => s.id === this.schoolClassFormData().schoolId);
  });

  protected readonly years = computed(() => {
    return [...new Set(this.selectedSchool()?.classes.map((c) => c.year) || [])].sort().reverse();
  });

  protected readonly yearClasses = computed(() => {
    const year = this.schoolClassFormData().year;
    const classes = this.selectedSchool()?.classes.filter((c) => c.year === Number(year));
    return SchoolStore.sortedClasses(classes || []);
  });

  constructor() {
    effect(() => {
      const years = this.years();
      const selectedYear = this.schoolClassFormData().year;
      untracked(() => {
        if (!!selectedYear && !years.includes(Number(selectedYear))) {
          this.schoolClassForm.year().value.set('');
        }
      });
    });

    effect(() => {
      const yearClasses = this.yearClasses();
      const selectedClassId = this.schoolClassFormData().classId;
      untracked(() => {
        if (!!selectedClassId && !yearClasses.map((c) => c.id).includes(selectedClassId)) {
          this.schoolClassForm.classId().value.set('');
        }
      });
    });
  }

  private validate(): void {
    const member = this.member();
    if (!!member && this.schoolClassForm().valid()) {
      const formData = this.schoolClassFormData();
      if (!!this.classId) {
        let index = member.schoolClassIds.findIndex((c) => c === this.classId) || -1;
        if (index >= 0) {
          member.schoolClassIds.splice(index, 1, formData.classId);
        } else {
          member.schoolClassIds.push(formData.classId);
        }
      } else {
        member.schoolClassIds.push(formData.classId);
      }

      this.familyStore.updateFamilyMember(member);
      this.dialogRef.close(true);
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  public openAddClassDialog() {
    const school = this.selectedSchool();
    if (!!school) {
      this.dialog.open(EditClass, {
        panelClass: 'dialog',
        data: {
          school: school,
        },
      });
    }
  }

  public openAddSchoolDialog() {
    this.dialog.open(EditSchool, {
      panelClass: 'dialog',
    });
  }
}
