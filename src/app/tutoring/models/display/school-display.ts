import { School } from '../school';
import { SchoolClassDisplay } from './school-class-display';

export class SchoolDisplay {
  constructor(
    public school: School,
    public classes: SchoolClassDisplay[],
  ) {}
}
