import { effect, Service, signal } from '@angular/core';

import { GoogleUser } from '../models/google-user';

@Service()
export class AuthenticationService {
  static readonly CLIENT_ID =
    '344404452907-3rolv6u3u94tstsive2d14mnhde6s1ag.apps.googleusercontent.com';

  isGsiLoaded = signal<boolean>(false);
  tokenClient = signal<google.accounts.oauth2.TokenClient | undefined>(undefined);
  googleUser = signal<GoogleUser | undefined>(undefined);
  accessToken = signal<string | undefined>(undefined);

  constructor() {
    this.loadScript();
    effect(() => {
      const tokenClient = this.tokenClient();
      const googleUser = this.googleUser();
      if (!!tokenClient && !!googleUser?.email) {
        tokenClient.requestAccessToken({
          hint: googleUser.email,
        });
      }
    });
  }

  loadScript() {
    if (typeof google !== 'undefined' && google?.accounts?.id) {
      this.isGsiLoaded.set(true);
      this.initializeGsi();
      return;
    }

    let gsiScript = document.createElement('script');
    gsiScript.src = 'https://accounts.google.com/gsi/client';
    gsiScript.async = true;
    gsiScript.defer = true;
    gsiScript.onload = () => {
      this.isGsiLoaded.set(true);
      this.initializeGsi();
      this;
    };
    gsiScript.onerror = () => {
      console.error('Failed to load Google Identity Services script.');
    };
    document.head.appendChild(gsiScript);
  }

  private initializeGsi() {
    if (!window.google?.accounts?.id) {
      console.warn('Google Identity Services SDK not available.');
      return;
    }

    google.accounts.id.initialize({
      client_id: AuthenticationService.CLIENT_ID,
      callback: (response) => this.handleGoogleSignIn(response),
      ux_mode: 'popup',
    });

    this.initializeTokenClient();
  }

  private handleGoogleSignIn(response: google.accounts.id.CredentialResponse) {
    this.googleUser.set(this.createGoogleUser(response.credential));
  }

  private initializeTokenClient() {
    // scope
    const scope = 'https://www.googleapis.com/auth/drive.file';
    this.tokenClient.set(
      google.accounts.oauth2.initTokenClient({
        client_id: AuthenticationService.CLIENT_ID,
        scope,
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            console.error(
              `Failed to get access token : ${tokenResponse.error} ${tokenResponse.error_description} ${tokenResponse.error_uri}`,
            );
          } else {
            this.accessToken.set(tokenResponse.access_token);
          }
        },
      }),
    );
  }

  private createGoogleUser(idToken: string) {
    const user = new GoogleUser(idToken);
    const payload = this.decodeJwt(idToken);
    user.id = payload.sub;
    user.name = payload.name;
    user.email = payload.email;
    user.photoUrl = payload.picture;
    user.firstName = payload['given_name'];
    user.lastName = payload['family_name'];
    return user;
  }

  private decodeJwt(idToken: string): any {
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );
    return JSON.parse(jsonPayload);
  }
}
