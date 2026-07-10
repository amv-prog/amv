import * as uuid from 'uuid';

export class Class {
  public id: string;

  constructor(
    public year: number,
    public teachers: string[],
    public grades: string[],
  ) {
    this.id = uuid.v4();
  }
}
