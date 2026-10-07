import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, take, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication-service';

export const googleAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('googleapis.com')) {
    const authenticationService = inject(AuthenticationService);
    // we need to add an access token as a header to access Google API
    const accessToken = authenticationService.accessToken();
    if (!!accessToken) {
      const clone = req.clone({
        setHeaders: { Authorization: `Bearer ${authenticationService.accessToken()}` },
      });
      return next(clone).pipe(
        catchError((error: HttpErrorResponse) => {
          // Si on a un statut 401, le token n'est pas valide
          if (error.status === 401) {
            return authenticationService.getAccessToken().pipe(
              take(1),
              switchMap((newToken: string) => {
                const newClone = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                });
                return next(newClone);
              }),
            );
          }

          return throwError(() => error);
        }),
      );
    } else {
      return authenticationService.getAccessToken().pipe(
        take(1),
        switchMap((newToken: string) => {
          const newClone = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(newClone);
        }),
      );
    }
  }
  return next(req);
};
