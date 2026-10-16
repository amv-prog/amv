import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';
import { DataService } from '../services/data-service';

export const savedDataResolver: ResolveFn<boolean> = (): Observable<boolean> => {
  const dataService = inject(DataService);
  return combineLatest([dataService.loadLatestData$(), dataService.loadSpreadsheetName$()]).pipe(
    map(() => true),
  );
};
