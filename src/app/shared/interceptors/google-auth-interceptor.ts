import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
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
      return next(clone);
    } else {
      console.error('No access token found for googleapis request');
    }
  }
  return next(req);
};
