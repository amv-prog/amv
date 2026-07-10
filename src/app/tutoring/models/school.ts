import * as uuid from 'uuid';
import { Class } from './class';

export class School {
  public id: string;
  public classes: Class[] = [];

  constructor(
    public name: string,
    public additionalInfo: string,
  ) {
    this.id = uuid.v4();
  }
}
