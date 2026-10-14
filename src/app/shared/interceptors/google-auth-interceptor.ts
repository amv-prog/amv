import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, filter, switchMap, take, throwError } from 'rxjs';
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
                if (!newToken) {
                  throw error;
                } else {
                  const newClone = req.clone({
                    setHeaders: { Authorization: `Bearer ${newToken}` },
                  });
                  return next(newClone);
                }
              }),
            );
          }
          // Erreur 403 pour le picker si le token est périmé
          if (error.status === 403) {
            authenticationService.resetAccessToken();
          }
          return throwError(() => error);
        }),
      );
    } else {
      return toObservable(authenticationService.isAuthenticationReady).pipe(
        filter((isReady) => !!isReady),
        switchMap(() => authenticationService.getAccessToken()),
        take(1),
        switchMap((newToken: string) => {
          if (!newToken) {
            return EMPTY;
          } else {
            const newClone = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(newClone);
          }
        }),
      );
    }
  }
  return next(req);
};
