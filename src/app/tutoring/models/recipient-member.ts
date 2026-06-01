import * as uuid from 'uuid';
import { Member } from './member';

export class RecipientMember implements Member {
  public id: string;
  public type: 'RECIPIENT' = 'RECIPIENT';

  constructor(
    public isParent: boolean,
    public firstName: string,
    public lastName: string,
    public phoneNumbers: string[],
    public email: string | undefined,
    public languages: string[],
    public birthDate: string | undefined,
    public additionalInfo: string,
  ) {
    this.id = uuid.v4();
  }
}
