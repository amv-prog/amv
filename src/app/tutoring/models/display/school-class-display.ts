import { Family } from '../family';
import { RecipientMember } from '../recipient-member';
import { SchoolClass } from '../school-class';

export class SchoolClassDisplay {
  constructor(
    public schoolClass: SchoolClass,
    public members: { member: RecipientMember; family: Family }[],
  ) {}
}
