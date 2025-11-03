import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from './cookie.service';
import { AppParams, HttpResponse, LoginData } from './model';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SecureAuthService {
  baseAPI = '';
  private signUpSubject = new Subject();
  private appSetupSubject = new Subject();
  private verifyEmailSubject = new Subject();
  private sendOTPSubject = new Subject<boolean>();
  private validateOTPSubject = new Subject();
  private forgotPasswordSubject = new Subject<boolean>();
  private resetPasswordSubject = new Subject<any>();
  private queryObject: any;

  emailValidationRegex =
    /([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)+/;
  passwordValidationRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])[A-Za-z\d`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]{8,100000}$/;
  phoneNumberValidationRegex = /^0\d{8,10}$/;

  constructor(
    private http: HttpClient,
    private readonly cookieStorage: CookieService
  ) {}

  checkForSpecialCharacters(query: string) {
    const pattern = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return pattern.test(query);
  }

  checkForDigits(query: string) {
    const pattern = /\d/;
    return pattern.test(query);
  }

  checkForLowercase(query: string) {
    const pattern = /[a-z]/;
    return pattern.test(query);
  }

  checkForUppercase(query: string) {
    const pattern = /[A-Z]/;
    return pattern.test(query);
  }

  private get headers(): HttpHeaders {
    let headers = new HttpHeaders();
    const accessToken = this.cookieStorage.get(this.cookieStorage.COOKIE_NAME);
    const tokenType = this.cookieStorage.get('tokenType');
    headers = headers.append('Authorization', `${tokenType} ${accessToken}`);

    return headers;
  }

  initializeApp(query: { params: string; url: string }): Observable<any> {
    const queryObject = query;
    this.queryObject = queryObject;
    const appParams = queryObject['params'];
    this.baseAPI = queryObject['url'];
    if (!appParams) {
      const error = {
        title: 'App Params Missing',
        message: 'No app params',
        type: 'error',
        queryObject: this.queryObject || {},
      };
      this.appSetupSubject.error(error);
      return this.appSetupSubject.asObservable();
    }
    // const role = queryObject['role'];
    this.cookieStorage.set('sso', this.baseAPI);
    this.cookieStorage.set('appParams', appParams);
    // this.cookieStorage.set('role', role);
    return this.appInit();
  }

  private appInit(): Observable<any> {
    const accessToken = this.cookieStorage.get('appParams') || '';
    let headers = new HttpHeaders();
    headers = headers.append('Basic', accessToken);

    this.http
      .post<AppParams>(`${this.baseAPI}/auth/get-token`, {}, { headers })
      .subscribe({
        next: (res) => {
          if (res) {
            this.setupApp(res);
          }
          const error = {
            title: 'No res from api call',
            message: 'Check backend app',
            type: 'error',
            queryObject: this.queryObject || {},
          };
          this.appSetupSubject.error(error);
        },
        error: (err) => {
          const error = {
            title: 'Api Error',
            message: `Something went wrong, Please refresh the app`,
            type: 'error',
            queryObject: this.queryObject || {},
          };
          this.appSetupSubject.error(error);
        },
      });

    return this.appSetupSubject.asObservable();
  }

  private setupApp(data: AppParams) {
    // this.appIsSetup = true;
    this.cookieStorage.remove('appParams');
    this.cookieStorage.set(
      'redirectUrl',
      data.client.redirectUri,
      data.expiresIn
    );
    this.cookieStorage.set('accessToken', data.accessToken, data.expiresIn);
    this.cookieStorage.set('tokenType', data.tokenType, data.expiresIn);
    this.appSetupSubject.next({
      title: 'Success',
      message: 'Items saved to cookies storage',
      type: 'success',
      queryObject: this.queryObject,
    });
  }

  // service
  login(payload: { EmailAddress: string; Password: string }) {
    const encodedData = btoa(JSON.stringify(payload));
    let headers = this.headers;
    headers = headers.append('Basic', encodedData);

    return this.http
      .post<LoginData>(`${this.baseAPI}/auth/authenticate`, {}, { headers })
      .pipe(
        // validate response
        map((res) => {
          if (!res?.userId) {
            throw new Error(res?.description || 'Login failed');
          }
          this.setUserDetails(res);
          return res as LoginData;
        }),
        catchError((err) =>
          throwError(() => new Error(err?.description || 'Failed'))
        )
      );
  }

  // setUserDetails(data: LoginData) {
  private setUserDetails(data: any) {
    for (const key in data) {
      if (data[key]) {
        if (typeof data[key] === 'object') {
          this.cookieStorage.set(key, JSON.stringify(data[key]));
        } else {
          this.cookieStorage.set(key, data[key]);
        }
      }
    }
  }

  signup(payload: any) {
    const headers: HttpHeaders = this.headers;
    return this.http
      .post<{ data?: any; description?: string }>(
        `${this.baseAPI}/auth/register`,
        payload,
        { headers }
      )
      .pipe(
        map((res) => {
          if (!res?.data) throw new Error(res?.description || 'Failed');
          return res.data; // return created user/info if needed
        }),
        catchError((err) =>
          throwError(() => new Error(err?.description || 'Failed'))
        )
      );
  }

  verifyEmail(payload: { token: string; userId: string }) {
    const headers: HttpHeaders = this.headers;
    return this.http
      .post<{ userId?: string; description?: string }>(
        `${this.baseAPI}/auth/Confirm-Email`,
        payload,
        { headers }
      )
      .pipe(
        map((res) => {
          if (!res?.userId) throw new Error(res?.description || 'Failed');
          return true;
        }),
        catchError((err) =>
          throwError(() => new Error(err?.description || 'Failed'))
        )
      );
  }

  sendOTP(OtpType: number) {
    const headers: HttpHeaders = this.headers;
    const userId = this.cookieStorage.get('userId');
    if (!userId) return throwError(() => new Error('No userId'));
    const payload = { OtpType, userId };

    return this.http
      .post<{ userId?: string; description?: string }>(
        `${this.baseAPI}/otp/send-otp`,
        payload,
        { headers }
      )
      .pipe(
        map((res) => {
          if (!res?.userId) throw new Error(res?.description || 'Failed');
          return true;
        }),
        catchError((err) =>
          throwError(() => new Error(err?.description || 'Failed'))
        )
      );
  }

  validateOTP(token: string) {
    const userId = this.cookieStorage.get('userId');
    if (!userId) return throwError(() => new Error('No userId'));
    const headers: HttpHeaders = this.headers;
    const payload = { token, userId };

    return this.http
      .post<LoginData>(`${this.baseAPI}/otp/validate-otp`, payload, { headers })
      .pipe(
        map((res) => {
          if (!res?.token)
            throw new Error((res as any)?.description || 'Failed');
          return res;
        }),
        tap((res) => this.setUserDetails(res)),
        catchError((err) =>
          throwError(() => new Error(err?.description || 'Failed'))
        )
      );
  }

  forgotPassword(emailAddress: string) {
    const headers: HttpHeaders = this.headers;
    const payload = { emailAddress };

    return this.http
      .post<{ data?: LoginData; description?: string }>(
        `${this.baseAPI}/auth/forgot-password`,
        payload,
        { headers }
      )
      .pipe(
        map((res) => {
          if (!res?.data) throw new Error(res?.description || 'Failed');
          // keep or drop this based on your flow; original code set details here:
          this.setUserDetails(res.data);
          return true;
        }),
        catchError((err) =>
          throwError(() => new Error(err?.description || 'Failed'))
        )
      );
  }

  resetPassword(payload: {
    password: string;
    confirmPassword: string;
    userId: string;
  }) {
    const headers: HttpHeaders = this.headers;

    return this.http
      .post<{ data?: unknown; description?: string }>(
        `${this.baseAPI}/auth/reset-password`,
        payload,
        { headers }
      )
      .pipe(
        map((res) => {
          // if API returns a string message in data:
          if (res?.data === 'Password reset successful.') return true;
          // or if API returns a boolean flag:
          if (res?.data === true) return true;
          // or throw with backend message
          throw new Error(res?.description || 'Failed');
        }),
        catchError((err) =>
          throwError(() => new Error(err?.description || 'Failed'))
        )
      );
  }
}
