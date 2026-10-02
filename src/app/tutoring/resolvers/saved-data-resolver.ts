import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../services/data-service';

export const savedDataResolver: ResolveFn<boolean> = (): Observable<boolean> => {
  const dataService = inject(DataService);
  return dataService.loadLatestData$();
};
