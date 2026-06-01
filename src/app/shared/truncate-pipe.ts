import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  transform(value: string = '', length = 40): string {
    const firstLine = value.trimStart().split('\n')[0];
    if (firstLine.length > length) {
      return `${firstLine.slice(0, length - 3)}...`;
    } else {
      return firstLine;
    }
  }
}
