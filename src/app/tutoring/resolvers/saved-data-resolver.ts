import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable } from 'rxjs';
import { SaveService } from '../services/save-service';

export const savedDataResolver: ResolveFn<boolean> = (): Observable<boolean> => {
  const saveService = inject(SaveService);
  return saveService.loadLatestData();
};
