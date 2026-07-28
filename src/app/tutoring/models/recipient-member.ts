import * as uuid from 'uuid';
import { Member } from './member';
import { School } from './school';
import { SchoolClass } from './school-class';

export class RecipientMember implements Member {
  public id: string;
  public type: 'RECIPIENT' = 'RECIPIENT';
  public school: School | undefined = undefined;
  public schoolClasses: SchoolClass[] = [];

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
