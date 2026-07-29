import { Dialog } from '@angular/cdk/dialog';
import { Component, computed, inject } from '@angular/core';
import { TruncatePipe } from '../../../../../shared/truncate-pipe';
import { School } from '../../../../models/school';
import { SchoolClass } from '../../../../models/school-class';
import { FamilyStore } from '../../../../stores/family-store';
import { SchoolStore } from '../../../../stores/school-store';
import { EditMemberClass } from './edit-member-class/edit-member-class';

@Component({
  selector: 'amv-recipient-school',
  imports: [TruncatePipe],
  templateUrl: './recipient-school.html',
})
export class RecipientSchool {
  private readonly familyStore = inject(FamilyStore);
  private readonly schoolStore = inject(SchoolStore);
  protected readonly member = this.familyStore.selectedFamilyMember;

  protected readonly sortedSchoolClassesDisplay = computed(() => {
    return this.sortedClasses(
      this.member()?.schoolClassIds.map((id) => {
        const schoolClassObject = this.schoolStore.findSchoolClassObject(id)();
        return new RecipientClassDisplay(
          id,
          schoolClassObject?.school,
          schoolClassObject?.schoolClass,
        );
      }) || [],
    );
  });

  private readonly dialog = inject(Dialog);

  public openNewClassDialog() {
    this.dialog.open(EditMemberClass, {
      panelClass: 'dialog',
    });
  }

  private sortedClasses(classes: RecipientClassDisplay[]): RecipientClassDisplay[] {
    return [...classes].sort(
      (c1, c2) => this.displayClassSortWeight(c1) - this.displayClassSortWeight(c2),
    );
  }

  private displayClassSortWeight(classDisplay: RecipientClassDisplay): number {
    return !!classDisplay.schoolClass ? SchoolStore.classSortWeight(classDisplay.schoolClass) : 0;
  }
}

class RecipientClassDisplay {
  constructor(
    public classId: string,
    public school: School | undefined,
    public schoolClass: SchoolClass | undefined,
  ) {}
}
