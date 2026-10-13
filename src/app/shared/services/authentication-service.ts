import { effect, inject, Service, signal, WritableSignal } from '@angular/core';

import { Subject } from 'rxjs';
import { SessionStorageService } from './session-storage-service';

@Service()
export class AuthenticationService {
  static readonly CLIENT_ID =
    '344404452907-3rolv6u3u94tstsive2d14mnhde6s1ag.apps.googleusercontent.com';
  static readonly APP_ID = '344404452907';
  private readonly scope = 'https://www.googleapis.com/auth/drive.file';

  private readonly sessionStorage = inject(SessionStorageService);

  isAuthenticationReady = signal<boolean>(false);
  tokenClient = signal<google.accounts.oauth2.TokenClient | undefined>(undefined);
  accessToken: WritableSignal<string | undefined>;

  private tokenSubject = new Subject<string>();

  constructor() {
    this.loadScript();

    this.accessToken = signal<string | undefined>(
      this.sessionStorage.getItem<string>('accessToken') || undefined,
    );
    effect(() => {
      const token = this.accessToken();
      if (!!token) {
        this.sessionStorage.setItem('accessToken', token);
      } else {
        this.sessionStorage.removeItem('accessToken');
      }
    });
  }

  loadScript() {
    if (typeof google !== 'undefined' && google?.accounts?.id) {
      this.initializeTokenClient();
      this.isAuthenticationReady.set(true);
      return;
    }

    let gsiScript = document.createElement('script');
    gsiScript.src = 'https://accounts.google.com/gsi/client';
    gsiScript.async = true;
    gsiScript.defer = true;
    gsiScript.onload = () => {
      this.initializeTokenClient();
      this.isAuthenticationReady.set(true);
      this;
    };
    gsiScript.onerror = () => {
      console.error('Failed to load Google Identity Services script.');
    };
    document.head.appendChild(gsiScript);
  }

  private initializeTokenClient() {
    if (!window.google?.accounts?.id) {
      console.warn('Google Identity Services SDK not available.');
      return;
    }
    // scope
    this.tokenClient.set(
      google.accounts.oauth2.initTokenClient({
        client_id: AuthenticationService.CLIENT_ID,
        scope: this.scope,
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            console.error(
              `Failed to get access token : ${tokenResponse.error} ${tokenResponse.error_description} ${tokenResponse.error_uri}`,
            );
            this.tokenSubject.error('Failed to retrieve access token');
          } else {
            this.accessToken.set(tokenResponse.access_token);
            this.tokenSubject.next(tokenResponse.access_token);
          }
        },
      }),
    );
  }

  getAccessToken() {
    this.tokenClient()?.requestAccessToken({ prompt: '' });
    return this.tokenSubject.asObservable();
  }

  handleGoogleSignOut() {
    const accessToken = this.accessToken();
    if (!!accessToken) {
      google.accounts.oauth2.revoke(accessToken, () => {
        this.accessToken.set(undefined);
      });
    } else {
      this.accessToken.set(undefined);
    }
  }
}
