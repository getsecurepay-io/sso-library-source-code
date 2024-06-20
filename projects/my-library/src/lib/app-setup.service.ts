import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from './cookie.service';
import { AppParams } from './model';

@Injectable({
  providedIn: 'root',
})
export class AppSetupService {
  private baseUrl = 'https://secureauth.secureid-digital.com.ng/api';
  private appIsSetup = false;
  private query =
    'eyJDbGllbnRJZCI6InNzby5hZG1pbi5jbGllbnQiLCJDbGllbnRTZWNyZXQiOiJIOFN2Qkd0c3hzOXVvb2c2MHN0MlUwaWw1TzlpR1BWRWtmQjluWExlNEdwWlBlRExqYk8xRUZacWFMTlBScjFNIiwiR3JhbnRUeXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIn0=';

  constructor(
    private readonly http: HttpClient,
    private readonly cookieStorage: CookieService
  ) {}

  initializeApp(query: any = this.query) {
    const appParams = query['params'];
    if (!appParams) {
      const error = {
        title: 'App Params Missing',
        message: 'Please go back to the admin app',
        type: 'error',
      };
      return error;
    }
    const role = query['role'];

    this.cookieStorage.set('appParams', appParams);
    this.cookieStorage.set('role', role);
    return this.appInit();
  }

  private appInit() {
    this.http.post<AppParams>(`${this.baseUrl}/auth/get-token`, {}).subscribe({
      next: (res) => {
        if (res) {
          return this.setupApp(res);
        }
        const error = {
          title: 'App Params Missing',
          message: 'Please go back to the admin app',
          type: 'error',
        };
        return error;
      },
      error: (err) => {
        const error = {
          title: 'App Params Missing',
          message: `Something went wrong, Please refresh the app`,
          type: 'error',
        };
        return error;
      },
    });
  }

  private setupApp(data: AppParams) {
    this.appIsSetup = true;
    this.cookieStorage.remove('appParams');
    this.cookieStorage.set(
      'redirectUrl',
      data.client.redirectUri,
      data.expiresIn
    );
    this.cookieStorage.set('accessToken', data.accessToken, data.expiresIn);
    this.cookieStorage.set('tokenType', data.tokenType, data.expiresIn);
    return {
      title: 'Success',
      message: 'Items saved to cookies storage',
      type: 'success',
    };
  }
}
