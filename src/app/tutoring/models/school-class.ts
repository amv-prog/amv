import * as uuid from 'uuid';

export class SchoolClass {
  public id: string;

  constructor(
    public year: number,
    public teachers: string[],
    public grades: string[],
    public additionalInfo: string,
  ) {
    this.id = uuid.v4();
  }
}
