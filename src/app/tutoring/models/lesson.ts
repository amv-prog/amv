import * as uuid from 'uuid';

export class Lesson {
  public id: string;

  constructor(
    public tutorId: string,
    public studentId: string,
    public dayOfWeek: number,
    public time: string,
    public startDate: string,
    public endDate?: string,
  ) {
    this.id = uuid.v4();
  }
}
