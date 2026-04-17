import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Member } from '../../models/member';
import { MemberStore } from '../../stores/member-store';

@Component({
  selector: 'amv-add-member',
  imports: [ReactiveFormsModule],
  templateUrl: './add-member.html',
})
export class AddMember {
  private readonly router = inject(Router);
  private readonly memberStore = inject(MemberStore);

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly firstNameCtrl = this.fb.control('');
  protected readonly lastNameCtrl = this.fb.control('');

  protected readonly memberForm = this.fb.group({
    firstName: this.firstNameCtrl,
    lastName: this.lastNameCtrl,
  });

  register(): void {
    this.memberStore.addMember(new Member(this.firstNameCtrl.value, this.lastNameCtrl.value));
    this.router.navigate(['members']);
  }
}
