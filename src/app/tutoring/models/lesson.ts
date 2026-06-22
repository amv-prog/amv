import * as uuid from 'uuid';

export class Lesson {
  public id: string;

  constructor(
    public studentId: string,
    public tutorId: string,
    public dayOfWeek: number,
    public time: string,
    public place: 'ASSOCIATION' | 'HOME',
    public startDate: string,
    public endDate?: string,
  ) {
    this.id = uuid.v4();
  }
}
