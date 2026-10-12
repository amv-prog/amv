import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading-service';

export const SkipSpinner = new HttpContextToken<boolean>(() => false);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SkipSpinner)) {
    return next(req);
  }
  const loadingService = inject(LoadingService);
  loadingService.loadingStart();
  return next(req).pipe(
    finalize(() => {
      loadingService.loadingStop();
    }),
  );
};
