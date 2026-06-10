import * as uuid from 'uuid';
import { Member } from './member';

export class VolunteerMember implements Member {
  public id: string;
  public type: 'VOLUNTEER' = 'VOLUNTEER';

  constructor(
    public isTutor: boolean,
    public firstName: string,
    public lastName: string,
    public phoneNumbers: string[],
    public email: string | undefined,
    public languages: string[],
    public additionalInfo: string,
  ) {
    this.id = uuid.v4();
  }
}
