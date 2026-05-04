import { Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Member } from '../../models/member';
import { MemberStore } from '../../stores/member-store';

@Component({
  selector: 'amv-edit-member',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-member.html',
})
export class EditMember {
  private readonly router = inject(Router);
  private readonly memberStore = inject(MemberStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly member = computed(() =>
    this.memberStore.members().find((m) => m.id === this.route.snapshot.paramMap.get('id')),
  );

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly firstNameCtrl = this.fb.control(
    this.member()?.firstName || '',
    Validators.required,
  );
  protected readonly lastNameCtrl = this.fb.control(
    this.member()?.lastName || '',
    Validators.required,
  );

  protected readonly memberForm = this.fb.group({
    firstName: this.firstNameCtrl,
    lastName: this.lastNameCtrl,
  });

  register(): void {
    if (this.memberForm.valid) {
      let current = this.member();
      if (!!current) {
        current.firstName = this.firstNameCtrl.value;
        current.lastName = this.lastNameCtrl.value;
        this.memberStore.updateMember(current);
      } else {
        this.memberStore.addMember(new Member(this.firstNameCtrl.value, this.lastNameCtrl.value));
      }
      this.router.navigate(['members']);
    }
  }
}
