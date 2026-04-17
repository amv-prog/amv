import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { LocalStorageService } from '../../shared/local-storage-service';
import { Member } from '../models/member';

@Injectable({
  providedIn: 'root',
})
export class MemberStore {
  private readonly localStorage = inject(LocalStorageService);

  members: WritableSignal<Member[]>;

  constructor() {
    this.members = signal<Member[]>(this.localStorage.getItem<Member[]>('members') || []);

    effect(() => {
      this.localStorage.setItem('members', this.members());
    });
  }

  addMember(member: Member) {
    this.members.update((members) => [...members, member]);
  }
}
