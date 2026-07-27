import { Dialog } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { TruncatePipe } from '../../../../shared/truncate-pipe';
import { School } from '../../../models/school';
import { SchoolClass } from '../../../models/school-class';
import { SchoolStore } from '../../../stores/school-store';
import { EditClass } from '../edit-class/edit-class';
import { EditSchool } from '../edit-school/edit-school';

@Component({
  selector: 'amv-school-list',
  imports: [TruncatePipe],
  templateUrl: './school-list.html',
})
export class SchoolList {
  private readonly dialog = inject(Dialog);

  protected readonly schoolStore = inject(SchoolStore);

  protected readonly schools = this.schoolStore.sortedSchools;

  public openEditSchoolDialog(school?: School) {
    this.dialog.open(EditSchool, {
      panelClass: 'dialog',
      data: {
        school,
      },
    });
  }

  public openAddClassDialog(school: School) {
    this.dialog.open(EditClass, {
      panelClass: 'dialog',
      data: {
        school,
      },
    });
  }

  public openEditClassDialog(school: School, schoolClass: SchoolClass) {
    this.dialog.open(EditClass, {
      panelClass: 'dialog',
      data: {
        school,
        class: schoolClass,
      },
    });
  }

  public sortedClasses(classes: SchoolClass[]): SchoolClass[] {
    return SchoolStore.sortedClasses(classes);
  }
}
