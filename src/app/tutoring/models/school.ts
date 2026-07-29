import * as uuid from 'uuid';
import { SchoolClass } from './school-class';

export class School {
  public id: string;
  public classes: SchoolClass[] = [];

  constructor(
    public name: string,
    public additionalInfo: string,
  ) {
    this.id = uuid.v4();
  }
}
