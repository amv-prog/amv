import * as uuid from 'uuid';
import { Address } from './address';
import { RecipientMember } from './recipient-member';

export class Family {
  public id: string;
  public address: Address | undefined;
  public members: RecipientMember[] = [];

  constructor(
    public name: string,
    public additionalInfo: string,
  ) {
    this.id = uuid.v4();
  }
}
