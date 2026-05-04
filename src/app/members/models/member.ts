import * as uuid from 'uuid';

export class Member {
  public id: string;

  constructor(
    public firstName: string,
    public lastName: string,
  ) {
    this.id = uuid.v4();
  }
}
