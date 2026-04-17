import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { MemberStore } from '../../stores/member-store';

@Component({
  selector: 'amv-member-list',
  imports: [RouterLink],
  templateUrl: './member-list.html',
})
export class MemberList {
  protected readonly memberStore = inject(MemberStore);

  protected readonly members = this.memberStore.members;

}
