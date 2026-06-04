import * as uuid from 'uuid';
import { Address } from '../../shared/models/address';
import { RecipientMember } from './recipient-member';

export class Family {
  public id: string;
  public members: RecipientMember[] = [];
  public contributionValidity: string | undefined;

  constructor(
    public name: string,
    public additionalInfo: string,
    public address: Address | undefined,
  ) {
    this.id = uuid.v4();
  }
}
